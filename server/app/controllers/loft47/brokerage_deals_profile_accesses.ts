import { Request, Response } from "express"

import api from "../../api";


export async function createBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    console.log('createBrokerageDealProfileAccess:', brokerage_id, req.body)
    const response = await api.post(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'createBrokerageDealProfileAccess error:' + err })
  }
}

export async function updateBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id, profile_access_id } = req.params
    console.log('updateBrokerageDealProfileAccess:', brokerage_id, deal_id, profile_access_id, req.body)
    const response = await api.patch(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'updateBrokerageDealProfileAccess error:' + err })
  }
}