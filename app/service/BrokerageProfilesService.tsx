export const BrokerageProfilesService = {
  getBrokerageProfiles: async (brokerage_id: string, agentEmail: string) => {
    try {
      const params = new URLSearchParams({
        'filter[email][in]': agentEmail
      });
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/profiles?${params}`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  createBrokerageProfile: async (brokerage_id: string, profile: any) => {
    console.log('createBrokerageProfile:', brokerage_id, profile)
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  updateBrokerageProfile: async (brokerage_id: string, profile_id: string, profile: any) => {
    console.log('updateBrokerageProfile:', brokerage_id, profile_id, profile)
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/profiles/${profile_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },  
        body: JSON.stringify(profile)
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}