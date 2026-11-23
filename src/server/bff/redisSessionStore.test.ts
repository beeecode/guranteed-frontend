import assert from "node:assert/strict"
import test from "node:test"
import { RedisSessionStore, validateRedisUrl, type RedisCommands } from "./redisSessionStore.ts"
import type { StoredSessionRecord } from "./sessionStore.ts"

class FakeRedis implements RedisCommands {
  isOpen = false
  fail = false
  values = new Map<string, string>()
  async connect() { if (this.fail) throw new Error("store unavailable"); this.isOpen = true }
  async set(key: string, value: string, options: { PX: number; NX: true }) {
    if (this.fail) throw new Error("store unavailable")
    if (options.NX && this.values.has(key)) return null
    this.values.set(key, value); return "OK"
  }
  async get(key: string) { if (this.fail) throw new Error("store unavailable"); return this.values.get(key) ?? null }
  async del(key: string) { if (this.fail) throw new Error("store unavailable"); return this.values.delete(key) ? 1 : 0 }
  async eval(script: string, options: { keys: string[]; arguments: string[] }) {
    if (this.fail) throw new Error("store unavailable")
    const raw = this.values.get(options.keys[0]); if (!raw) return 0
    const record = JSON.parse(raw) as StoredSessionRecord
    if (script.includes("gfms:acquire-refresh")) {
      const [version, owner, leaseExpiry, now] = options.arguments
      if (record.version !== Number(version) || record.expiresAt <= Number(now) || (record.refreshLease && record.refreshLease.expiresAt > Number(now))) return 0
      record.refreshLease = { owner, expiresAt: Number(leaseExpiry) }
    } else if (script.includes("gfms:commit-refresh")) {
      const [version, owner, sealedState, expiresAt, now] = options.arguments
      if (record.version !== Number(version) || record.refreshLease?.owner !== owner || record.expiresAt <= Number(now) || Number(expiresAt) <= Number(now)) return 0
      record.version += 1; record.sealedState = sealedState; record.expiresAt = Number(expiresAt); delete record.refreshLease
    } else if (script.includes("gfms:release-refresh")) {
      const [version, owner, now] = options.arguments
      if (record.version !== Number(version) || record.refreshLease?.owner !== owner || record.expiresAt <= Number(now)) return 0
      delete record.refreshLease
    } else throw new Error("unknown script")
    this.values.set(options.keys[0], JSON.stringify(record)); return 1
  }
}

const record = (expiresAt: number): StoredSessionRecord => ({ id: "session-1", version: 1, sealedState: "sealed-one", expiresAt })

test("Redis store create/read/delete and collision behavior", async () => {
  const redis = new FakeRedis(); const now = 1_000
  const store = new RedisSessionStore(redis, "test:", () => now)
  await store.create(record(10_000))
  assert.deepEqual(await store.read("session-1"), record(10_000))
  await assert.rejects(store.create(record(10_000)), (error: unknown) => (error as { code?: string }).code === "SESSION_COLLISION")
  await store.delete("session-1"); assert.equal(await store.read("session-1"), null)
})

test("Redis refresh lease is atomic, expires, and commits by version and owner", async () => {
  const redis = new FakeRedis(); let now = 1_000
  const first = new RedisSessionStore(redis, "test:", () => now)
  const second = new RedisSessionStore(redis, "test:", () => now)
  await first.create(record(20_000))
  assert.equal(await first.acquireRefresh("session-1", 1, "owner-a", 2_000, now), true)
  assert.equal(await second.acquireRefresh("session-1", 1, "owner-b", 2_000, now), false)
  assert.equal(await second.commitRefresh("session-1", 1, "owner-b", "stolen", 20_000), false)
  now = 2_001
  assert.equal(await second.acquireRefresh("session-1", 1, "owner-b", 3_000, now), true)
  assert.equal(await second.commitRefresh("session-1", 1, "owner-b", "sealed-two", 25_000), true)
  assert.deepEqual(await first.read("session-1"), { id: "session-1", version: 2, sealedState: "sealed-two", expiresAt: 25_000 })
  assert.equal(await first.commitRefresh("session-1", 1, "owner-a", "stale", 25_000), false)
})

test("Redis store removes malformed/expired records and fails closed during outage", async () => {
  const redis = new FakeRedis(); const store = new RedisSessionStore(redis, "test:", () => 5_000)
  redis.values.set("test:bad", "not-json")
  assert.equal(await store.read("bad"), null)
  redis.values.set("test:expired", JSON.stringify({ ...record(4_000), id: "expired" }))
  assert.equal(await store.read("expired"), null)
  redis.fail = true
  await assert.rejects(store.read("anything"), /unavailable/)
})

test("Redis URLs require TLS except explicitly enabled local loopback", () => {
  assert.match(validateRedisUrl("rediss://user:secret@redis.example.invalid:6379", true), /^rediss:/)
  assert.throws(() => validateRedisUrl("redis://redis.example.invalid:6379", false, true), /TLS/)
  assert.throws(() => validateRedisUrl("redis://127.0.0.1:6379", false, false), /TLS/)
  assert.match(validateRedisUrl("redis://127.0.0.1:6379", false, true), /^redis:/)
})
