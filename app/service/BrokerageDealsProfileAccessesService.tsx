export const BrokerageDealsProfileAccessesService = {
  createBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access: any) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile_access)
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err)
    }
  },
  updateBrokerageDealProfileAccess: async (brokerage_id: string, deal_id: string, profile_access_id: string, profile_access: any) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile_access)
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}