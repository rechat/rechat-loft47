import { apiFetch } from '@libs/apiFetch'

export const AddressService = {
  retrieveAddress: async (address_id: string) => {
    try {
      const data = await apiFetch(`/loft47/addresses/${address_id}`, {
        method: 'GET'
      })
      return data
    } catch (err) {
      console.error(err);
    }
  },
  updateAddress: async (address_id: string, address: any) => {
    try {
      const data = await apiFetch(`/loft47/addresses/${address_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(address)
      })
      return data
    } catch (err) {
      console.error(err);
    }
  }
}