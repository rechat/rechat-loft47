import { apiFetch } from '@libs/apiFetch'

export const BrokerageProfilesService = {
  getBrokerageProfiles: async (brokerage_id: string, filters: any) => {
    try {
      const params = new URLSearchParams(filters);
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/profiles?${params}`, {
        method: 'GET'
      })
      return data
    } catch (err) {
      console.error(err);
    }
  },
  createBrokerageProfile: async (brokerage_id: string, profile: any) => {
    console.log('createBrokerageProfile:', brokerage_id, profile)
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })
      return data
    } catch (err) {
      console.error(err);
    }
  },
  updateBrokerageProfile: async (brokerage_id: string, profile_id: string, profile: any) => {
    console.log('updateBrokerageProfile:', brokerage_id, profile_id, profile)
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/profiles/${profile_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },  
        body: JSON.stringify(profile)
      })
      return data
    } catch (err) {
      console.error(err);
    }
  }
}