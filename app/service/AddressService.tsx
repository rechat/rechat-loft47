import { apiFetch } from '@libs/apiFetch'

export const AddressService = {
  retrieveAddress: async (address_id: string) => {
    try {
      const data = await apiFetch(`/loft47/addresses/${address_id}`, {
        method: 'GET'
      })
      return data
    } catch (err) {
      return { error: err }
    }
  },
  updateAddress: async (address_id: string, address: Address) => {
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
      return { error: err }
    }
  }
}