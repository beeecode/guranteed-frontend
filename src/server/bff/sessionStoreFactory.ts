import type { BffConfig } from "./config.ts"
import { InMemorySessionStore, type SessionStore } from "./sessionStore.ts"

const memoryStore = new InMemorySessionStore()

/**
 * The external driver is intentionally fail-closed until shared infrastructure
 * is selected and configured. Production can never fall back to process memory.
 */
export function sessionStoreFor(config: BffConfig): SessionStore {
  if (config.sessionStore === "memory" && process.env.NODE_ENV !== "production") return memoryStore
  throw Object.assign(new Error("A shared external session store is required for this integration environment."), {
    status: 503,
    code: "SESSION_STORE_UNAVAILABLE",
  })
}
