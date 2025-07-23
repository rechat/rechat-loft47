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
      return data
    } catch (err) {
      return { error: err }
    }
  }
} 