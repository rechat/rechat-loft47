import { Request, Response } from 'express'
import api, { handleAxiosError } from './app/api'
import { db } from './app/db'
import { rechatLoft47DealsMapping } from './db/schema'
import { eq } from 'drizzle-orm'

// Simple proxy handlers for Loft47 API calls

export async function signIn(req: Request, res: Response) {
  try {
    const response = await api.post('/sign_in', req.body, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    const token = response.headers.authorization
    if (token) {
      api.defaults.headers.common['x-session-token'] = token
    }
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function getConfig(_req: Request, res: Response) {
  res.json({
    LOFT47_EMAIL: process.env.LOFT47_EMAIL || '',
    LOFT47_PASSWORD: process.env.LOFT47_PASSWORD || '',
    LOFT47_URL: process.env.LOFT47_URL || ''
  })
}

// Generic proxy handler for GET requests
export function createGetHandler(path: string) {
  return async (req: Request, res: Response) => {
    try {
      const response = await api.get(path.replace(/:[^/]+/g, (match) => {
        const param = match.slice(1)
        return req.params[param] || match
      }))
      res.status(response.status).json(response.data)
    } catch (err: any) {
      const error = handleAxiosError(err)
      res.status(error.status).json({ error: error.message })
    }
  }
}

// Generic proxy handler for POST requests
export function createPostHandler(path: string) {
  return async (req: Request, res: Response) => {
    try {
      const response = await api.post(path.replace(/:[^/]+/g, (match) => {
        const param = match.slice(1)
        return req.params[param] || match
      }), req.body, {
        headers: { 'Content-Type': 'application/json' }
      })
      res.status(response.status).json(response.data)
    } catch (err: any) {
      const error = handleAxiosError(err)
      res.status(error.status).json({ error: error.message })
    }
  }
}

// Generic proxy handler for PATCH requests
export function createPatchHandler(path: string) {
  return async (req: Request, res: Response) => {
    try {
      const response = await api.patch(path.replace(/:[^/]+/g, (match) => {
        const param = match.slice(1)
        return req.params[param] || match
      }), req.body, {
        headers: { 'Content-Type': 'application/json' }
      })
      res.status(response.status).json(response.data)
    } catch (err: any) {
      const error = handleAxiosError(err)
      res.status(error.status).json({ error: error.message })
    }
  }
}

// Generic proxy handler for DELETE requests
export function createDeleteHandler(path: string) {
  return async (req: Request, res: Response) => {
    try {
      const response = await api.delete(path.replace(/:[^/]+/g, (match) => {
        const param = match.slice(1)
        return req.params[param] || match
      }))
      res.status(response.status).json(response.data)
    } catch (err: any) {
      const error = handleAxiosError(err)
      res.status(error.status).json({ error: error.message })
    }
  }
}

// Deal mapping handlers
export async function getMapping(req: Request, res: Response) {
  try {
    const { deal_id } = req.params
    
    const [row] = await db
      .select()
      .from(rechatLoft47DealsMapping)
      .where(eq(rechatLoft47DealsMapping.rechatDealId, deal_id))
    
    if (!row) {
      return res.status(404).json({ error: 'Mapping not found' })
    }
    
    // Check if loft47DealId is null/undefined
    if (!row.loft47DealId) {
      return res.status(404).json({ error: 'Mapping found but no Loft47 deal ID' })
    }
    
    res.json({ loft47_deal_id: row.loft47DealId, rechat_deal_id: row.rechatDealId })
  } catch (error) {
    console.error('Error getting mapping:', error)
    res.status(500).json({ error: 'Database error' })
  }
}

export async function createMapping(req: Request, res: Response) {
  try {
    const { rechat_deal_id, loft47_deal_id } = req.body
    
    const [inserted] = await db
      .insert(rechatLoft47DealsMapping)
      .values({
        rechatDealId: rechat_deal_id,
        loft47DealId: loft47_deal_id
      })
      .returning()
    
    res.status(201).json(inserted)
  } catch (error) {
    console.error('Error creating mapping:', error)
    res.status(500).json({ error: 'Database error' })
  }
}

export async function home(_req: Request, res: Response) {
  res.json({ message: 'Loft47 Integration API' })
}

export async function manifest(_req: Request, res: Response) {
  res.sendFile('/Users/emilsedgh/Projects/rechat/loft47/manifest.json')
}