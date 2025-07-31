import { apiFetch } from '@libs/apiFetch'

export const BrokerageDealsProfileAccessesService = {
  retrieveBrokerageDealProfileAccesses: async (brokerage_id: string, deal_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses`, {
        method: 'GET'
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  retrieveBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, {
        method: 'GET'
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  createBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access: ProfileAccess) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile_access)
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  updateBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access_id: string, profile_access: ProfileAccess) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile_access)
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  deleteBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access_id: string) => { 
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, {
        method: 'DELETE',
        parseJson: false
      })
      if (data.status === 204) {
        return { status: 204, message: 'Deleted successfully, no response body.' }
      } else {
        return { status: data.status, message: 'Deleted failed, response body:' + data.statusText }
      }
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  }
}