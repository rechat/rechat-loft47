// server/app/controllers/env.ts
import { Request, Response } from 'express'

/**
 * Returns whitelisted environment variables that the front-end may need at runtime.
 * Make sure to expose ONLY non-sensitive values.
 */
export const getPublicEnv = (_req: Request, res: Response) => {
  res.json({
    LOFT47_EMAIL: process.env.LOFT47_EMAIL || '',
    LOFT47_PASSWORD: process.env.LOFT47_PASSWORD || '',
    LOFT47_URL: process.env.LOFT47_URL || ''
  })
}
