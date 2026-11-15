import { createHash } from "crypto"



export const GENESIS_HASH = 'GENESIS'

export interface HashableAuditEntry {
    previousHash: string
    operatorId: string
    kind: string
    actorUserId: string | null
    actorName: string 
    alertId: string | null
    playerId: string | null
    message: string
    createdAt: Date
}


export class AuditHasher {

    static compute(e: HashableAuditEntry): string {
        const payload = [
            e.previousHash,
            e.operatorId,
            e.kind,
            e.actorUserId ?? '',
            e.actorName,
            e.alertId ?? '',
            e.playerId ?? '',
            e.message,
            e.createdAt.toISOString(),
        ].join('|')
        return createHash('sha256').update(payload, 'utf-8').digest('hex')
    }

    static firstBroken(
        entries: readonly (HashableAuditEntry & {hash: string})[],
        expectedPrevious = GENESIS_HASH
    ): number {
        let previous = expectedPrevious
        for(let i = 0; i < entries.length; i++){
            const entry = entries[i]!
            if(entry.previousHash !== previous || AuditHasher.compute(entry) !== entry.hash) return i
            previous = entry.hash
        }
        return -1
    }

}