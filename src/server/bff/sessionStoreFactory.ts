import type { BffConfig } from "./config.ts"
import { InMemorySessionStore, type SessionStore } from "./sessionStore.ts"
import { createRedisSessionStore, validateRedisUrl } from "./redisSessionStore.ts"

const memoryStore = new InMemorySessionStore()
let externalStore: SessionStore | undefined
let externalKey = ""

/**
 * The external driver is intentionally fail-closed until shared infrastructure
 * is selected and configured. Production can never fall back to process memory.
 */
export function sessionStoreFor(config: BffConfig): SessionStore {
  if (config.sessionStore === "memory" && process.env.NODE_ENV !== "production") return memoryStore
  if (config.sessionStore === "external" && config.redisUrl) {
    const url = validateRedisUrl(config.redisUrl)
    const key = `${url}|${config.redisPrefix || ""}`
    if (!externalStore || externalKey !== key) {
      externalStore = createRedisSessionStore(url, config.redisPrefix)
      externalKey = key
    }
    return externalStore
  }
  throw Object.assign(new Error("A shared external session store is required for this integration environment."), {
    status: 503,
    code: "SESSION_STORE_UNAVAILABLE",
  })
}
