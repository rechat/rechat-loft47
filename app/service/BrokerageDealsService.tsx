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
  }
}