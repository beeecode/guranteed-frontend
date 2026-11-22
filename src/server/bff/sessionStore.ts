export interface StoredSessionRecord {
  id: string
  version: number
  sealedState: string
  expiresAt: number
  refreshLease?: { owner: string; expiresAt: number }
}

export interface SessionStore {
  create(record: StoredSessionRecord): Promise<void>
  read(id: string): Promise<StoredSessionRecord | null>
  acquireRefresh(id: string, expectedVersion: number, owner: string, leaseExpiresAt: number, now: number): Promise<boolean>
  commitRefresh(id: string, expectedVersion: number, owner: string, sealedState: string, expiresAt: number): Promise<boolean>
  releaseRefresh(id: string, expectedVersion: number, owner: string): Promise<void>
  delete(id: string): Promise<void>
}

const clone = (record: StoredSessionRecord): StoredSessionRecord => structuredClone(record)

/** Local/test CAS store. Production integration must provide a shared driver. */
export class InMemorySessionStore implements SessionStore {
  private readonly records = new Map<string, StoredSessionRecord>()

  async create(record: StoredSessionRecord) {
    if (this.records.has(record.id)) throw new Error("Session identifier collision")
    this.records.set(record.id, clone(record))
  }
  async read(id: string) { const record = this.records.get(id); return record ? clone(record) : null }
  async acquireRefresh(id: string, expectedVersion: number, owner: string, leaseExpiresAt: number, now: number) {
    const record = this.records.get(id)
    if (!record || record.version !== expectedVersion) return false
    if (record.refreshLease && record.refreshLease.expiresAt > now) return false
    record.refreshLease = { owner, expiresAt: leaseExpiresAt }
    return true
  }
  async commitRefresh(id: string, expectedVersion: number, owner: string, sealedState: string, expiresAt: number) {
    const record = this.records.get(id)
    if (!record || record.version !== expectedVersion || record.refreshLease?.owner !== owner) return false
    record.version += 1
    record.sealedState = sealedState
    record.expiresAt = expiresAt
    delete record.refreshLease
    return true
  }
  async releaseRefresh(id: string, expectedVersion: number, owner: string) {
    const record = this.records.get(id)
    if (record?.version === expectedVersion && record.refreshLease?.owner === owner) delete record.refreshLease
  }
  async delete(id: string) { this.records.delete(id) }
}
