import { eq } from 'drizzle-orm'
import { Request, Response } from 'express'

import api, { handleAxiosError } from './app/api'
import { db } from './app/db'
import { rechatLoft47DealsMapping, brandLoft47Credentials } from './db/schema'

// Simple proxy handlers for Loft47 API calls

export async function signIn(req: Request, res: Response) {
  try {
    // Extract API URL from request body if provided, fallback to environment
    const { api_url, ...signInData } = req.body
    const apiUrl =
      api_url || process.env.LOFT47_API_URL || 'https://api.loft47.com/v1'

    // Create a new axios instance for this request with the correct base URL
    const apiInstance = require('axios').create({
      baseURL: apiUrl,
      withCredentials: true
    })

    const response = await apiInstance.post('/sign_in', signInData, {
      headers: { 'Content-Type': 'application/json' }
    })

    const token = response.headers.authorization

    if (token) {
      // Store the token and API URL in the default api instance for subsequent requests
      api.defaults.headers.common['x-session-token'] = token
      api.defaults.baseURL = apiUrl
    }

    res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    res.status(error.status).json({ error: error.message })
  }
}

// Look up credentials for a brand hierarchy
export async function getBrandCredentials(req: Request, res: Response) {
  try {
    const { brand } = req.body

    if (!brand) {
      return res.status(400).json({ error: 'Brand information required' })
    }

    // Build brand hierarchy array (current brand + all parents)
    const brandHierarchy: string[] = []
    let currentBrand = brand

    while (currentBrand) {
      brandHierarchy.push(currentBrand.id)
      currentBrand = currentBrand.parent
    }

    // Look for credentials starting from current brand, going up the hierarchy
    for (const brandId of brandHierarchy) {
      const [credentials] = await db
        .select()
        .from(brandLoft47Credentials)
        .where(eq(brandLoft47Credentials.brandId, brandId))

      if (credentials) {
        // Build URLs based on environment
        const apiUrl = credentials.isStaging
          ? 'https://api.staging.loft47.com/v1'
          : 'https://api.loft47.com/v1'

        const appUrl = credentials.isStaging
          ? 'https://staging.loft47.com'
          : 'https://app.loft47.com'

        return res.json({
          LOFT47_EMAIL: credentials.loft47Email,
          LOFT47_PASSWORD: credentials.loft47Password,
          LOFT47_API_URL: apiUrl,
          LOFT47_APP_URL: appUrl,
          IS_STAGING: credentials.isStaging,
          BRAND_ID: credentials.brandId
        })
      }
    }

    // No credentials found in the hierarchy
    res
      .status(404)
      .json({ error: 'No Loft47 credentials found for this brand hierarchy' })
  } catch (error) {
    console.error('Error getting brand credentials:', error)
    res.status(500).json({ error: 'Database error' })
  }
}

// Generic proxy handler for GET requests
export function createGetHandler(path: string) {
  return async (req: Request, res: Response) => {
    try {
      const response = await api.get(
        path.replace(/:[^/]+/g, match => {
          const param = match.slice(1)

          return req.params[param] || match
        })
      )

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
      const response = await api.post(
        path.replace(/:[^/]+/g, match => {
          const param = match.slice(1)

          return req.params[param] || match
        }),
        req.body,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )

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
      const response = await api.patch(
        path.replace(/:[^/]+/g, match => {
          const param = match.slice(1)

          return req.params[param] || match
        }),
        req.body,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )

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
      const response = await api.delete(
        path.replace(/:[^/]+/g, match => {
          const param = match.slice(1)

          return req.params[param] || match
        })
      )

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
      return res
        .status(404)
        .json({ error: 'Mapping found but no Loft47 deal ID' })
    }

    res.json({
      loft47_deal_id: row.loft47DealId,
      rechat_deal_id: row.rechatDealId
    })
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

// Create or update brand credentials
export async function createBrandCredentials(req: Request, res: Response) {
  try {
    const {
      brand_id,
      loft47_email,
      loft47_password,
      is_staging = false
    } = req.body

    if (!brand_id || !loft47_email || !loft47_password) {
      return res
        .status(400)
        .json({ error: 'Brand ID, email, and password are required' })
    }

    // Check if credentials already exist for this brand
    const [existing] = await db
      .select()
      .from(brandLoft47Credentials)
      .where(eq(brandLoft47Credentials.brandId, brand_id))

    if (existing) {
      // Update existing credentials
      const [updated] = await db
        .update(brandLoft47Credentials)
        .set({
          loft47Email: loft47_email,
          loft47Password: loft47_password,
          isStaging: is_staging
        })
        .where(eq(brandLoft47Credentials.brandId, brand_id))
        .returning()

      res.json(updated)
    } else {
      // Create new credentials
      const [inserted] = await db
        .insert(brandLoft47Credentials)
        .values({
          brandId: brand_id,
          loft47Email: loft47_email,
          loft47Password: loft47_password,
          isStaging: is_staging
        })
        .returning()

      res.status(201).json(inserted)
    }
  } catch (error) {
    console.error('Error creating/updating brand credentials:', error)
    res.status(500).json({ error: 'Database error' })
  }
}

// Get credentials for a specific brand ID
export async function getBrandCredentialsByBrandId(
  req: Request,
  res: Response
) {
  try {
    const { brand_id } = req.params

    const [credentials] = await db
      .select()
      .from(brandLoft47Credentials)
      .where(eq(brandLoft47Credentials.brandId, brand_id))

    if (!credentials) {
      return res
        .status(404)
        .json({ error: 'Credentials not found for this brand' })
    }

    // Build URLs based on environment
    const apiUrl = credentials.isStaging
      ? 'https://api.staging.loft47.com/v1'
      : 'https://api.loft47.com/v1'

    const appUrl = credentials.isStaging
      ? 'https://staging.loft47.com'
      : 'https://app.loft47.com'

    res.json({
      LOFT47_EMAIL: credentials.loft47Email,
      LOFT47_PASSWORD: credentials.loft47Password,
      LOFT47_API_URL: apiUrl,
      LOFT47_APP_URL: appUrl,
      IS_STAGING: credentials.isStaging,
      BRAND_ID: credentials.brandId
    })
  } catch (error) {
    console.error('Error getting brand credentials by ID:', error)
    res.status(500).json({ error: 'Database error' })
  }
}
