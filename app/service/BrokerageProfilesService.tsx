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
  }
}