import { apiFetch } from '@libs/apiFetch'

export const BrokeragesService = {
  /**
   * Calls back-end proxy to retrieve brokerages from Loft47.
   * Avoids CORS error that occurs when calling the Loft47 API directly
   * from the browser.
   */
  retrieveBrokerages: async () => {
    try {
      const data = await apiFetch('/loft47/brokerages', {
        method: 'GET'
      })

      return data
    } catch (err) {
      console.error(err);
    }
  }
}