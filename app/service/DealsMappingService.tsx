export const DealsMappingService = {
  /**
   * Calls back-end proxy to retrieve all mappings.   
   */
  retrieveDealsMappings: async () => {
    try {
      const res = await fetch(process.env.SITE_URL + '/loft47/deal_mappings', {
        method: 'GET'
      })

      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  getMappingById: async (id: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/deal_mappings/${id}`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  getMappingByLoft47DealId: async (loft47DealId: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/deal_mappings/loft47/${loft47DealId}`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  getMappingByRechatDealId: async (rechatDealId: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/deal_mappings/rechat/${rechatDealId}`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  createMapping: async (rechatDealId: string, loft47DealId: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + '/loft47/deal_mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rechat_deal_id: rechatDealId, loft47_deal_id: loft47DealId })
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}