import { PrismaClient } from '@/generated/prisma/client'

declare global {
  var __mangoPrisma__: PrismaClient | undefined
}

export const db = global.__mangoPrisma__ ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__mangoPrisma__ = db
}
