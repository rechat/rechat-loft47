import { apiFetch } from '@libs/apiFetch'

export const BrokerageDealsService = {
  getBrokerageDeals: async (brokerage_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals`, {
        method: 'GET'
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  getBrokerageDeal: async (brokerage_id: string, deal_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}`, {
        method: 'GET'
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  createDeal: async (brokerage_id: string, deal: LoftDeal) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deal)
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  updateDeal: async (brokerage_id: string, loft47DealId: string, deal: LoftDeal) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${loft47DealId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deal)
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  }
}