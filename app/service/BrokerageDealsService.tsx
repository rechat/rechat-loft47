export const BrokerageDealsService = {
  /**
   * Calls back-end proxy to retrieve deals for a given brokerage from Loft47.
   * Avoids CORS error that occurs when calling the Loft47 API directly
   * from the browser.
   */
  getBrokerageDeals: async (brokerage_id: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/deals`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  getBrokerageDeal: async (brokerage_id: string, deal_id: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/deals/${deal_id}`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  createDeal: async (brokerage_id: string, deal: any) => {
    console.log('createDeal:', brokerage_id, deal)
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: deal.deal_type,
            attributes: {
              ...deal
            }
          }
        })
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  updateDeal: async (brokerage_id: string, loft47DealId: string, deal: any) => {
    console.log('updateDeal:', loft47DealId, deal)
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/deals/${loft47DealId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: deal.deal_type,
            attributes: {
              ...deal
            }
          }
        })
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}