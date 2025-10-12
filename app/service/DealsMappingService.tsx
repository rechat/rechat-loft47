import { apiFetch } from '@libs/apiFetch'

export const DealsMappingService = {
  getMappingById: async (id: string) => {
    try {
      const data = await apiFetch(`/loft47/deal_mappings/${id}`, {
        method: 'GET'
      })

      return data
    } catch (err: any) {
      if (err.status === 404) {
        return { notFound: true }
      }

      return { status: err.status, error: err.body.error }
    }
  },
  getMappingByLoft47DealId: async (loft47DealId: string) => {
    try {
      const data = await apiFetch(
        `/loft47/deal_mappings/loft47/${loft47DealId}`,
        {
          method: 'GET'
        }
      )

      return data
    } catch (err: any) {
      if (err.status === 404) {
        return { notFound: true }
      }

      return { status: err.status, error: err.body.error }
    }
  },
  getMappingByRechatDealId: async (rechatDealId: string) => {
    try {
      const data = await apiFetch(
        `/loft47/deal_mappings/rechat/${rechatDealId}`,
        {
          method: 'GET'
        }
      )

      return data
    } catch (err: any) {
      if (err.status === 404) {
        return { notFound: true }
      }

      return { status: err.status, error: err.body.error }
    }
  },
  createMapping: async (rechatDealId: string, loft47DealId: string) => {
    try {
      const data = await apiFetch('/loft47/deal_mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rechat_deal_id: rechatDealId,
          loft47_deal_id: loft47DealId
        })
      })

      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  }
}
