import { Request, Response } from 'express'

import api, { handleAxiosError } from '../../api'

export async function getBrokerageDeals(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/deals`)

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function getBrokerageDeal(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    const response = await api.get(
      `/brokerages/${brokerage_id}/deals/${deal_id}`
    )

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function createBrokerageDeal(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const response = await api.post(
      `/brokerages/${brokerage_id}/deals`,
      req.body
    )

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function updateBrokerageDeal(req: Request, res: Response) {
  const { brokerage_id, deal_id } = req.params

  try {
    const response = await api.patch(
      `/brokerages/${brokerage_id}/deals/${deal_id}`,
      req.body
    )

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}
