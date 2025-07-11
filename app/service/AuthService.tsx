
export const AuthService = {
  /**
   * Calls back-end proxy to sign in the user against Loft47.
   * Avoids CORS error that occurs when calling the Loft47 API directly
   * from the browser.
   */
  signIn: async (email: string, password: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + '/loft47/sign_in', {
        method: 'POST',
        credentials: 'include',
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
      console.log('signIn res:', res)
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}