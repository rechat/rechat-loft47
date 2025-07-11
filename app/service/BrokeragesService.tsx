
export const BrokeragesService = {
  /**
   * Calls back-end proxy to retrieve brokerages from Loft47.
   * Avoids CORS error that occurs when calling the Loft47 API directly
   * from the browser.
   */
  retrieveBrokerages: async () => {
    try {
      const res = await fetch(process.env.SITE_URL + '/loft47/brokerages', {
        method: 'GET',
        credentials: 'include'
      })
      console.log('retrieveBrokerages / res:', res)
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}