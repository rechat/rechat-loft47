import { apiFetch } from '@libs/apiFetch'

export const BrokerageDealsService = {
  getBrokerageDeals: async (brokerage_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals`, {
        method: 'GET'
      })
      return data
    } catch (err) {
      console.error(err);
    }
  },
  getBrokerageDeal: async (brokerage_id: string, deal_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${deal_id}`, {
        method: 'GET'
      })
      return data
    } catch (err) {
      console.error(err);
    }
  },
  createDeal: async (brokerage_id: string, deal: any) => {
    console.log('createDeal:', brokerage_id, deal)
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deal)
      })
      return data
    } catch (err) {
      console.error(err);
    }
  },
  updateDeal: async (brokerage_id: string, loft47DealId: string, deal: any) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deals/${loft47DealId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deal)
      })
      return data
    } catch (err) {
      console.error(err);
    }
  }
}