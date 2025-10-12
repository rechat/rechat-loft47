import { apiFetch } from '@libs/apiFetch'

export const BrokerageProfilesService = {
  getBrokerageProfiles: async (
    brokerage_id: string,
    filters: ProfileFilters
  ) => {
    try {
      const params = new URLSearchParams(filters)
      const data = await apiFetch(
        `/loft47/brokerages/${brokerage_id}/profiles?${params}`,
        {
          method: 'GET'
        }
      )

      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  createBrokerageProfile: async (brokerage_id: string, profile: Profile) => {
    try {
      const data = await apiFetch(
        `/loft47/brokerages/${brokerage_id}/profiles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profile)
        }
      )

      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  updateBrokerageProfile: async (
    brokerage_id: string,
    profile_id: string,
    profile: Profile
  ) => {
    try {
      const data = await apiFetch(
        `/loft47/brokerages/${brokerage_id}/profiles/${profile_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profile)
        }
      )

      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  }
}
