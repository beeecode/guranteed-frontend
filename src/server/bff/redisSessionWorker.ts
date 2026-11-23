import { createRedisSessionStore } from "./redisSessionStore.ts"

const input = JSON.parse(Buffer.from(process.argv[2] || "", "base64url").toString("utf8")) as {
  url: string
  prefix: string
  operation: "acquire" | "commit" | "delete" | "read"
  id: string
  version?: number
  owner?: string
  leaseExpiresAt?: number
  sealedState?: string
  expiresAt?: number
  now?: number
}
const store = createRedisSessionStore(input.url, input.prefix)
let result: unknown
if (input.operation === "acquire") result = await store.acquireRefresh(input.id, input.version!, input.owner!, input.leaseExpiresAt!, input.now!)
else if (input.operation === "commit") result = await store.commitRefresh(input.id, input.version!, input.owner!, input.sealedState!, input.expiresAt!)
else if (input.operation === "delete") { await store.delete(input.id); result = true }
else result = await store.read(input.id)
process.stdout.write(JSON.stringify(result))
process.exit(0)
