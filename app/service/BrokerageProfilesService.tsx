export const BrokerageProfilesService = {
  getBrokerageProfiles: async (brokerage_id: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/brokerages/${brokerage_id}/profiles`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}