import { apiFetch } from '@libs/apiFetch'

export const BrokerageDealsProfileAccessesService = {
  retrieveBrokerageDealProfileAccesses: async (brokerage_id: string, deal_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses`, {
        method: 'GET'
      })
      return data
    } catch (err) {
      return { error: err }
    }
  },
  retrieveBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, {
        method: 'GET'
      })
      return data
    } catch (err) {
      return { error: err }
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
    } catch (err) {
      return { error: err }
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
    } catch (err) {
      return { error: err }
    }
  },
  deleteBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access_id: string) => { 
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, {
        method: 'DELETE',
        parseJson: false
      })
      if (data.status === 204) {
        console.log('Deleted successfully, no response body.')
      } else {
        console.log('Deleted failed, response body:', data.statusText)
      }
    } catch (err) {
      console.error(err)
    }
  }
}