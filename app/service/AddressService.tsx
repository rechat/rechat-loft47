export const AddressService = {
  retrieveAddress: async (address_id: string) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/addresses/${address_id}`, {
        method: 'GET'
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  },
  updateAddress: async (address_id: string, address: any) => {
    try {
      const res = await fetch(process.env.SITE_URL + `/loft47/addresses/${address_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(address)
      })
      const data = res.json()
      return data
    } catch (err) {
      console.error(err);
    }
  }
}