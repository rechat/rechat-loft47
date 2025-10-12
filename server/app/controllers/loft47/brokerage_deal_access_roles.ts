import { Request, Response } from 'express'

import api, { handleAxiosError } from '../../api'

export async function retrieveBrokerageDealAccessRoles(
  req: Request,
  res: Response
) {
  try {
    const { brokerage_id } = req.params
    const response = await api.get(
      `/brokerages/${brokerage_id}/deal_access_roles`
    )

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function retrieveBrokerageDealAccessRole(
  req: Request,
  res: Response
) {
  try {
    const { brokerage_id, deal_access_role_id } = req.params
    const response = await api.get(
      `/brokerages/${brokerage_id}/deal_access_roles/${deal_access_role_id}`
    )

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function createBrokerageDealAccessRole(
  req: Request,
  res: Response
) {
  try {
    const { brokerage_id } = req.params
    const response = await api.post(
      `/brokerages/${brokerage_id}/deal_access_roles`,
      req.body
    )

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function updateBrokerageDealAccessRole(
  req: Request,
  res: Response
) {
  try {
    const { brokerage_id, deal_access_role_id } = req.params
    const response = await api.patch(
      `/brokerages/${brokerage_id}/deal_access_roles/${deal_access_role_id}`,
      req.body
    )

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function deleteBrokerageDealAccessRole(
  req: Request,
  res: Response
) {
  try {
    const { brokerage_id, deal_access_role_id } = req.params
    const response = await api.delete(
      `/brokerages/${brokerage_id}/deal_access_roles/${deal_access_role_id}`
    )

    return res.status(response.status).send(response.statusText)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}
