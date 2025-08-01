import { apiFetch } from '@libs/apiFetch'

export const BrokerageDealAccessRolesService = {
  retrieveBrokerageDealAccessRoles: async (brokerage_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deal_access_roles`, {
        method: 'GET'
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  retrieveBrokerageDealAccessRole: async (brokerage_id: string, deal_access_role_id: string) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deal_access_roles/${deal_access_role_id}`, {
        method: 'GET'
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  createBrokerageDealAccessRole: async (brokerage_id: string, deal_access_role: DealAccessRole) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deal_access_roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deal_access_role)
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  updateBrokerageDealAccessRole: async (brokerage_id: string, deal_access_role_id: string, deal_access_role: DealAccessRole) => {
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deal_access_roles/${deal_access_role_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deal_access_role)
      })
      return data
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  },
  deleteBrokerageDealAccessRole: async (brokerage_id: string, deal_access_role_id: string) => { 
    try {
      const data = await apiFetch(`/loft47/brokerages/${brokerage_id}/deal_access_roles/${deal_access_role_id}`, {
        method: 'DELETE',
        parseJson: false
      })
      if (data.status === 204) {
        return { status: 204, message: 'Deleted successfully, no response body.' }
      } else {
        return { status: data.status, message: 'Deleted failed, response body:' + data.statusText }
      }
    } catch (err: any) {
      return { status: err.status, error: err.body.error }
    }
  }
}