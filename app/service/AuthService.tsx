import { apiFetch } from '@libs/apiFetch'

export const AuthService = {
  /**
   * Calls back-end proxy to sign in the user against Loft47.
   * Avoids CORS error that occurs when calling the Loft47 API directly
   * from the browser.
   */
  signIn: async (email: string, password: string) => {
    try {
      const data = await apiFetch('/loft47/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: {
            email,
            password
          }
        })
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  }
}