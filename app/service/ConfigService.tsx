import { apiFetch } from '@libs/apiFetch'

export const ConfigService = {
  /**
   * Fetches public environment variables from the backend.
   */
  getPublicEnv: async () => {
    try {
      const data = await apiFetch('/config/env', {
        method: 'GET',
        credentials: 'include'
      })
      return data as {
        LOFT47_EMAIL: string
        LOFT47_PASSWORD: string
      }
    } catch (err) {
      console.error(err)
      return null
    }
  }
} 