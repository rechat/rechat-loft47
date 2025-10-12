import { apiFetch } from '@libs/apiFetch'

// Simple API wrapper for Loft47 integration
export const api = {
  // Auth
  async signIn(email: string, password: string, apiUrl?: string) {
    try {
      const payload: any = { user: { email, password } }

      if (apiUrl) {
        payload.api_url = apiUrl
      }

      return await apiFetch('/loft47/sign_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Get brand credentials
  async getBrandCredentials(brand: any) {
    try {
      return await apiFetch('/loft47/brand_credentials/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand })
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Create/update brand credentials
  async createBrandCredentials(
    brandId: string,
    email: string,
    password: string,
    isStaging: boolean = false
  ) {
    try {
      return await apiFetch('/loft47/brand_credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          loft47_email: email,
          loft47_password: password,
          is_staging: isStaging
        })
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Get credentials for specific brand
  async getBrandCredentialsByBrandId(brandId: string) {
    try {
      return await apiFetch(`/loft47/brand_credentials/${brandId}`, {
        method: 'GET'
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Brokerages
  async getBrokerages() {
    try {
      return await apiFetch('/loft47/brokerages', { method: 'GET' })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Profiles
  async getProfiles(brokerageId: string, filters: Record<string, string>) {
    try {
      const params = new URLSearchParams(filters)

      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/profiles?${params}`,
        { method: 'GET' }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  async createProfile(brokerageId: string, profile: any) {
    try {
      return await apiFetch(`/loft47/brokerages/${brokerageId}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  async updateProfile(brokerageId: string, profileId: string, profile: any) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/profiles/${profileId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Deals
  async createDeal(brokerageId: string, deal: any) {
    try {
      return await apiFetch(`/loft47/brokerages/${brokerageId}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal)
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  async getDeal(brokerageId: string, dealId: string) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/deals/${dealId}`,
        { method: 'GET' }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  async updateDeal(brokerageId: string, dealId: string, deal: any) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/deals/${dealId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deal)
        }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Address
  async updateAddress(addressId: string, address: any) {
    try {
      return await apiFetch(`/loft47/addresses/${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Deal accesses
  async getDealAccesses(brokerageId: string, dealId: string) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/deals/${dealId}/accesses`,
        { method: 'GET' }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  async createDealAccess(brokerageId: string, dealId: string, access: any) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/deals/${dealId}/accesses`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(access)
        }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  async deleteDealAccess(
    brokerageId: string,
    dealId: string,
    accessId: string
  ) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/deals/${dealId}/accesses/${accessId}`,
        {
          method: 'DELETE',
          parseJson: false
        }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Deal access roles
  async getDealAccessRoles(brokerageId: string) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/deal_access_roles`,
        { method: 'GET' }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  async createDealAccessRole(brokerageId: string, role: any) {
    try {
      return await apiFetch(
        `/loft47/brokerages/${brokerageId}/deal_access_roles`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(role)
        }
      )
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  },

  // Deal mappings
  async getMapping(rechatDealId: string) {
    try {
      return await apiFetch(`/loft47/deal_mappings/rechat/${rechatDealId}`, {
        method: 'GET'
      })
    } catch (err: any) {
      if (err.status === 404) {
        return { notFound: true }
      }

      return { error: err.body?.error, status: err.status }
    }
  },

  async createMapping(rechatDealId: string, loft47DealId: string) {
    try {
      return await apiFetch('/loft47/deal_mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rechat_deal_id: rechatDealId,
          loft47_deal_id: loft47DealId
        })
      })
    } catch (err: any) {
      return { error: err.body?.error, status: err.status }
    }
  }
}
