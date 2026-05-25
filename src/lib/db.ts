import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Check if the database is available.
 * On Vercel/serverless, SQLite is read-only and may not work.
 * This function tests the connection without throwing.
 */
let _dbAvailable: boolean | null = null

export async function isDbAvailable(): Promise<boolean> {
  if (_dbAvailable !== null) return _dbAvailable
  try {
    await db.siteContent.findFirst({ take: 1 })
    _dbAvailable = true
    return true
  } catch {
    _dbAvailable = false
    return false
  }
}

/**
 * Reset the cached DB availability check (e.g., after a failed operation)
 */
export function markDbUnavailable(): void {
  _dbAvailable = false
}
