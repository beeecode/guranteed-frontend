import { randomUUID } from "node:crypto"

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,64}$/

export const isSafeRequestId = (value: string | null | undefined) => Boolean(value && SAFE_REQUEST_ID.test(value))
export const requestIdFor = (request: Request) => {
  const incoming = request.headers.get("x-request-id")
  return isSafeRequestId(incoming) ? incoming! : randomUUID()
}
