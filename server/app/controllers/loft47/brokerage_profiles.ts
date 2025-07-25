import { Request, Response } from "express"

import api, { handleAxiosError } from "../../api";


export async function getBrokerageProfiles(req: Request, res: Response) {
  const { brokerage_id } = req.params
  const { email, search, type } = req.query
  try {
    const response = await api.get(`/brokerages/${brokerage_id}/profiles`, {
      params: {
        ...(email && { 'filter[email][in]': email }),
        ...(search && { 'filter[search]': search }),
        ...(type && { 'filter[type][in]': type })
      }
    });
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function createBrokerageProfile(req: Request, res: Response) {
  const { brokerage_id } = req.params
  try {
    const response = await api.post(`/brokerages/${brokerage_id}/profiles`, req.body)
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function getBrokerageProfile(req: Request, res: Response) {
  try {
    const { brokerage_id, profile_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/profiles/${profile_id}`)
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function updateBrokerageProfile(req: Request, res: Response) {
  try {
    const { brokerage_id, profile_id } = req.params
    const response = await api.patch(`/brokerages/${brokerage_id}/profiles/${profile_id}`, req.body)
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}