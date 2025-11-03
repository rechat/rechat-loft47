import { eq } from 'drizzle-orm'
import { Request, Response } from 'express'

import { createApiInstance, createAuthenticatedApiInstance, handleAxiosError } from './app/api'
import { db } from './app/db'
import { rechatLoft47DealsMapping, brandLoft47Credentials } from './db/schema'

// Simple proxy handlers for Loft47 API calls

// Helper function to extract and validate brand IDs from request
function extractBrandIds(req: Request): { brandIds: string[] | null, error: string | null } {
  // Try query first (for GET requests)
  const brandIdsQuery = req.query.brand_ids as string
  if (brandIdsQuery) {
    const brandIds = brandIdsQuery.split(',').filter(Boolean)
    return brandIds.length > 0 ? { brandIds, error: null } : { brandIds: null, error: 'Brand IDs required' }
  }
  
  // Try body (for POST/PATCH/DELETE requests)
  const brandIdsBody = req.body?.brand_ids
  if (brandIdsBody && Array.isArray(brandIdsBody) && brandIdsBody.length > 0) {
    return { brandIds: brandIdsBody, error: null }
  }
  
  return { brandIds: null, error: 'Brand IDs required' }
}

// Helper function to authenticate and handle common error responses
async function authenticateRequest(req: Request, res: Response): Promise<{ api: any, appUrl?: string, isStaging?: boolean, token?: string, apiUrl?: string } | null> {
  const { brandIds, error } = extractBrandIds(req)
  
  if (error || !brandIds) {
    res.status(400).json({ error: error || 'Brand IDs required' })
    return null
  }
  
  try {
    const authResult = await authenticateWithLoft47(brandIds)
    if (!authResult) {
      res.status(404).json({ error: 'No Loft47 credentials configured for this account' })
      return null
    }
    
    return authResult
  } catch (err: any) {
    // Handle specific authentication failure
    if (err.message === 'Authentication failed') {
      res.status(401).json({ error: 'Loft47 authentication failed - please check credentials' })
      return null
    }
    
    // For all other errors (network, etc), let them bubble up to be handled by the specific handler
    throw err
  }
}

// Middleware to authenticate with Loft47 based on brand hierarchy
async function authenticateWithLoft47(brandIds: string[]): Promise<{ api: any, appUrl?: string, isStaging?: boolean, token?: string, apiUrl?: string } | null> {
  if (!brandIds || brandIds.length === 0) return null
  
  // Use the brand hierarchy provided
  const brandHierarchy = brandIds
  
  // Look for credentials starting from current brand, going up the hierarchy
  for (const brandId of brandHierarchy) {
    const [credentials] = await db
      .select()
      .from(brandLoft47Credentials)
      .where(eq(brandLoft47Credentials.brandId, brandId))
    
    if (credentials) {
      // Set up API configuration
      const apiUrl = credentials.isStaging 
        ? 'https://api.staging.loft47.com/v1'
        : 'https://api.loft47.com/v1'
      
      const appUrl = credentials.isStaging
        ? 'https://staging.loft47.com'
        : 'https://app.loft47.com'

      // Create API instance for this brand
      const api = createApiInstance(apiUrl)
      
      try {
        // Authenticate with Loft47 server-side
        const authResponse = await api.post('/sign_in', {
          user: {
            email: credentials.loft47Email,
            password: credentials.loft47Password
          }
        })
        
        const token = authResponse.headers.authorization
        if (token) {
          // Return authenticated API instance
          const authenticatedApi = createAuthenticatedApiInstance(apiUrl, token)
          return { api: authenticatedApi, appUrl, isStaging: credentials.isStaging, token, apiUrl }
        }
        
        return { api, appUrl, isStaging: credentials.isStaging, apiUrl }
        
      } catch (authError: any) {
        console.error('Loft47 authentication failed:', authError.message)
        console.error('Auth error details:', authError.response?.status, authError.response?.data)
        
        // If it's a 401 from Loft47, that means bad credentials - throw specific error
        if (authError.response?.status === 401) {
          throw new Error('Authentication failed')
        }
        
        // For other errors (network, 500, etc), re-throw the original error
        throw authError
      }
    }
  }
  
  return null
}

// Get app configuration (URLs) for opening deals
export async function getAppConfig(req: Request, res: Response) {
  try {
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    res.json({
      LOFT47_APP_URL: authResult.appUrl,
      IS_STAGING: authResult.isStaging
    })
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' })
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

// Specific Loft47 API handlers
export async function getBrokerages(req: Request, res: Response) {
  try {
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const response = await authResult.api.get('/brokerages')
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function createBrokerage(req: Request, res: Response) {
  try {
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const { brand_ids, ...data } = req.body
    const response = await authResult.api.post('/brokerages', data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function getOffices(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const response = await authResult.api.get(`/brokerages/${brokerage_id}/offices`)
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function getProfiles(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    // Build query string from other query params (excluding brand_ids)
    // Convert to Loft47's filter format: filter[key]=value
    const queryParams = new URLSearchParams()
    Object.keys(req.query).forEach(key => {
      if (key !== 'brand_ids' && req.query[key]) {
        // Support both email and phoneNumber filters
        queryParams.append(`filter[${key}]`, req.query[key] as string)
      }
    })
    
    const queryString = queryParams.toString()
    const url = `/brokerages/${brokerage_id}/profiles${queryString ? `?${queryString}` : ''}`
    
    const response = await authResult.api.get(url)
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function createProfile(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const { brand_ids, ...data } = req.body
    const response = await authResult.api.post(`/brokerages/${brokerage_id}/profiles`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { brokerage_id, profile_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const data = req.body
    const response = await authResult.api.patch(`/brokerages/${brokerage_id}/profiles/${profile_id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function getDeals(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const response = await authResult.api.get(`/brokerages/${brokerage_id}/deals`)
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function createDeal(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const { brand_ids, ...data } = req.body

    const response = await authResult.api.post(`/brokerages/${brokerage_id}/deals`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    
    if (err.response) {      
      // Handle specific Loft47 API errors
      if (err.response.status === 400) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: err.response.data?.message || err.response.data || 'Bad request to Loft47 API',
          loft47_error: err.response.data
        })
      }
      
      if (err.response.status === 401) {
        return res.status(401).json({
          error: 'Authentication failed with Loft47',
          details: 'Invalid or expired Loft47 credentials'
        })
      }
      
      if (err.response.status === 403) {
        return res.status(403).json({
          error: 'Forbidden - insufficient permissions',
          details: 'Your Loft47 account does not have permission to create deals in this brokerage'
        })
      }
      
      if (err.response.status === 404) {
        return res.status(404).json({
          error: 'Brokerage not found',
          details: `Brokerage does not exist in Loft47`
        })
      }
      
      if (err.response.status === 422) {
        return res.status(422).json({
          error: 'Validation failed',
          details: 'The deal data does not meet Loft47 requirements',
          validation_errors: err.response.data?.errors || err.response.data
        })
      }
      
      if (err.response.status >= 500) {
        return res.status(502).json({
          error: 'Loft47 server error',
          details: 'Loft47 API is experiencing issues. Please try again later.',
          loft47_status: err.response.status
        })
      }
      
      // Generic Loft47 API error
      return res.status(err.response.status).json({
        error: 'Loft47 API error',
        details: err.response.data?.message || err.response.data || err.message,
        loft47_error: err.response.data
      })
    }
    
    // Network or other errors
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Cannot connect to Loft47',
        details: 'Unable to reach Loft47 API. Please check your network connection.'
      })
    }
    
    if (err.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'Request timeout',
        details: 'Request to Loft47 API timed out. Please try again.'
      })
    }
    
    // Generic server error
    res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while creating the deal'
    })
  }
}

export async function getDeal(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const response = await authResult.api.get(`/brokerages/${brokerage_id}/deals/${deal_id}`)
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function updateDeal(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const data = req.body
    const response = await authResult.api.patch(`/brokerages/${brokerage_id}/deals/${deal_id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function getDealAccesses(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const response = await authResult.api.get(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses`)
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function createDealAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const data = req.body
    const response = await authResult.api.post(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function deleteDealAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id, profile_access_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const response = await authResult.api.delete(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`)
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function getDealAccessRoles(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const response = await authResult.api.get(`/brokerages/${brokerage_id}/deal_access_roles`)
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function createDealAccessRole(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const { brand_ids, ...data } = req.body
    const response = await authResult.api.post(`/brokerages/${brokerage_id}/deal_access_roles`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
}

export async function updateAddress(req: Request, res: Response) {
  try {
    const { address_id } = req.params
    const authResult = await authenticateRequest(req, res)
    if (!authResult) return // Response already sent
    
    const data = req.body
    const response = await authResult.api.patch(`/addresses/${address_id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    res.status(response.status).json(response.data)
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(err.response.status).json({ 
        error: err.response.data?.message || err.response.data || err.message 
      })
    }
    
    const error = handleAxiosError(err)
    res.status(error.status).json({ error: error.message })
  }
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
