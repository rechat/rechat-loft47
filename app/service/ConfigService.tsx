import { apiFetch } from '@libs/apiFetch'

export const ConfigService = {
  /**
   * Fetches public environment variables from the backend.
   */
  getPublicEnv: async () => {
    try {
      const data = await apiFetch('/config/env', {
        method: 'GET'
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  }
} 