import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import test from "node:test"
import { randomUUID } from "node:crypto"
import { createRedisSessionStore, validateRedisUrl } from "./redisSessionStore.ts"

const run = promisify(execFile)
const url = process.env.GFMS_TEST_REDIS_URL
if (!url) throw new Error("GFMS_TEST_REDIS_URL is required for the Redis integration test.")
validateRedisUrl(url, false, true)
const prefix = `gfms:stage11:${randomUUID()}:`
const worker = new URL("./redisSessionWorker.ts", import.meta.url)
const invoke = async (input: Record<string, unknown>) => {
  const encoded = Buffer.from(JSON.stringify({ url, prefix, ...input })).toString("base64url")
  const { stdout } = await run(process.execPath, ["--experimental-strip-types", worker.pathname.replace(/^\/(.:\/)/, "$1"), encoded], { windowsHide: true })
  return JSON.parse(stdout)
}

test("independent processes coordinate refresh, stale commits, logout and restart recovery", async () => {
  const store = createRedisSessionStore(url, prefix)
  const id = randomUUID(); const now = Date.now(); const expiresAt = now + 60_000
  await store.create({ id, version: 1, sealedState: "sealed-one", expiresAt })
  try {
    const owners = [randomUUID(), randomUUID()]
    const acquired = await Promise.all(owners.map((owner) => invoke({ operation: "acquire", id, version: 1, owner, leaseExpiresAt: now + 10_000, now })))
    assert.equal(acquired.filter(Boolean).length, 1)
    const winner = owners[acquired.findIndex(Boolean)]
    assert.equal(await invoke({ operation: "commit", id, version: 1, owner: winner, sealedState: "sealed-two", expiresAt }), true)
    assert.equal(await invoke({ operation: "commit", id, version: 1, owner: winner, sealedState: "stale", expiresAt }), false)
    assert.deepEqual(await invoke({ operation: "read", id }), { id, version: 2, sealedState: "sealed-two", expiresAt })

    const logoutOwner = randomUUID()
    assert.equal(await invoke({ operation: "acquire", id, version: 2, owner: logoutOwner, leaseExpiresAt: now + 20_000, now }), true)
    assert.equal(await invoke({ operation: "delete", id }), true)
    assert.equal(await invoke({ operation: "commit", id, version: 2, owner: logoutOwner, sealedState: "must-not-resurrect", expiresAt }), false)
    assert.equal(await invoke({ operation: "read", id }), null)
  } finally { await store.delete(id) }
})
