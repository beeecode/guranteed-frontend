import { createClient, type RedisClientType } from "redis"
import type { SessionStore, StoredSessionRecord } from "./sessionStore.ts"

type EvalOptions = { keys: string[]; arguments: string[] }
export interface RedisCommands {
  isOpen: boolean
  connect(): Promise<unknown>
  set(key: string, value: string, options: { PX: number; NX: true }): Promise<string | null>
  get(key: string): Promise<string | null>
  del(key: string): Promise<number>
  eval(script: string, options: EvalOptions): Promise<unknown>
}

const ACQUIRE = `-- gfms:acquire-refresh
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
local expected = tonumber(ARGV[1])
local now = tonumber(ARGV[4])
if tonumber(record.version) ~= expected then return 0 end
if tonumber(record.expiresAt) <= now then redis.call('DEL', KEYS[1]); return 0 end
if record.refreshLease and tonumber(record.refreshLease.expiresAt) > now then return 0 end
record.refreshLease = { owner = ARGV[2], expiresAt = tonumber(ARGV[3]) }
redis.call('PSETEX', KEYS[1], math.max(1, tonumber(record.expiresAt) - now), cjson.encode(record))
return 1`

const COMMIT = `-- gfms:commit-refresh
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
local expected = tonumber(ARGV[1])
local expiresAt = tonumber(ARGV[4])
local now = tonumber(ARGV[5])
if tonumber(record.version) ~= expected then return 0 end
if not record.refreshLease or record.refreshLease.owner ~= ARGV[2] then return 0 end
if tonumber(record.expiresAt) <= now or expiresAt <= now then redis.call('DEL', KEYS[1]); return 0 end
record.version = expected + 1
record.sealedState = ARGV[3]
record.expiresAt = expiresAt
record.refreshLease = nil
redis.call('PSETEX', KEYS[1], math.max(1, expiresAt - now), cjson.encode(record))
return 1`

const RELEASE = `-- gfms:release-refresh
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
local now = tonumber(ARGV[3])
if tonumber(record.expiresAt) <= now then redis.call('DEL', KEYS[1]); return 0 end
if tonumber(record.version) ~= tonumber(ARGV[1]) then return 0 end
if not record.refreshLease or record.refreshLease.owner ~= ARGV[2] then return 0 end
record.refreshLease = nil
redis.call('PSETEX', KEYS[1], math.max(1, tonumber(record.expiresAt) - now), cjson.encode(record))
return 1`

const validRecord = (value: unknown): value is StoredSessionRecord => {
  const record = value as StoredSessionRecord
  return Boolean(record)
    && typeof record.id === "string"
    && Number.isSafeInteger(record.version) && record.version > 0
    && typeof record.sealedState === "string" && record.sealedState.length > 0
    && Number.isFinite(record.expiresAt)
    && (!record.refreshLease || (typeof record.refreshLease.owner === "string" && Number.isFinite(record.refreshLease.expiresAt)))
}

export function validateRedisUrl(raw: string, production = process.env.NODE_ENV === "production", allowLocalPlaintext = process.env.GFMS_ALLOW_INSECURE_LOCAL_REDIS === "true") {
  let url: URL
  try { url = new URL(raw) } catch { throw new Error("The shared session-store URL is invalid.") }
  const loopback = url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "::1"
  if (url.protocol !== "rediss:" && !(url.protocol === "redis:" && loopback && !production && allowLocalPlaintext)) {
    throw new Error("The shared session store must use TLS; plaintext Redis is allowed only on explicitly enabled local loopback.")
  }
  return url.toString()
}

export class RedisSessionStore implements SessionStore {
  private readonly client: RedisCommands
  private readonly prefix: string
  private readonly now: () => number
  constructor(client: RedisCommands, prefix = "gfms:session:", now = () => Date.now()) {
    this.client = client
    this.prefix = prefix
    this.now = now
  }
  private key(id: string) { return `${this.prefix}${id}` }
  private async ready() { if (!this.client.isOpen) await this.client.connect() }

  async create(record: StoredSessionRecord) {
    await this.ready()
    const ttl = Math.max(1, record.expiresAt - this.now())
    if (!validRecord(record) || ttl <= 1) throw Object.assign(new Error("The session record is invalid or expired."), { status: 401, code: "INVALID_SESSION" })
    const result = await this.client.set(this.key(record.id), JSON.stringify(record), { PX: ttl, NX: true })
    if (result !== "OK") throw Object.assign(new Error("Session identifier collision."), { status: 409, code: "SESSION_COLLISION" })
  }

  async read(id: string) {
    await this.ready()
    const raw = await this.client.get(this.key(id))
    if (!raw) return null
    try {
      const record: unknown = JSON.parse(raw)
      if (!validRecord(record) || record.id !== id || record.expiresAt <= this.now()) {
        await this.client.del(this.key(id))
        return null
      }
      return structuredClone(record)
    } catch {
      await this.client.del(this.key(id))
      return null
    }
  }

  async acquireRefresh(id: string, expectedVersion: number, owner: string, leaseExpiresAt: number, now: number) {
    await this.ready()
    return Number(await this.client.eval(ACQUIRE, { keys: [this.key(id)], arguments: [String(expectedVersion), owner, String(leaseExpiresAt), String(now)] })) === 1
  }
  async commitRefresh(id: string, expectedVersion: number, owner: string, sealedState: string, expiresAt: number) {
    await this.ready()
    return Number(await this.client.eval(COMMIT, { keys: [this.key(id)], arguments: [String(expectedVersion), owner, sealedState, String(expiresAt), String(this.now())] })) === 1
  }
  async releaseRefresh(id: string, expectedVersion: number, owner: string) {
    await this.ready()
    await this.client.eval(RELEASE, { keys: [this.key(id)], arguments: [String(expectedVersion), owner, String(this.now())] })
  }
  async delete(id: string) { await this.ready(); await this.client.del(this.key(id)) }
}

export function createRedisSessionStore(url: string, prefix?: string) {
  const client = createClient({
    url,
    socket: { connectTimeout: 5_000, reconnectStrategy: false },
  }) as RedisClientType
  client.on("error", () => undefined)
  return new RedisSessionStore(client as unknown as RedisCommands, prefix)
}
