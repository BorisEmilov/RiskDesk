
import { Prisma, PrismaClient } from '@prisma/client'

export type Tx = Prisma.TransactionClient
export type Db = PrismaClient | Tx

export class Database {
    readonly client: PrismaClient

    constructor(url: string) {
        this.client = new PrismaClient({ datasourceUrl: url })
    }

    inTransaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
        return this.client.$transaction(work, { maxWait: 5_000, timeout: 15_000 })
    }
    async disconnect() {
        await this.client.$disconnect()
    }
}

export function isUniqueViolation(err: unknown): boolean {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}

export function toNumber(value: Prisma.Decimal | number | null | undefined): number {
    if (value === null || value === undefined) return 0
    return typeof value === 'number' ? value : value.toNumber()
}