import { Request, Response } from "express"

import api, { handleAxiosError } from "../../api";

export async function retrieveBrokerageDealProfileAccesses(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses`);
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function retrieveBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id, profile_access_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`);
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function createBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    const response = await api.post(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function updateBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id, profile_access_id } = req.params
    const response = await api.patch(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function deleteBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id, profile_access_id } = req.params
    const response = await api.delete(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`);
    return res.status(response.status).send(response.statusText)
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}