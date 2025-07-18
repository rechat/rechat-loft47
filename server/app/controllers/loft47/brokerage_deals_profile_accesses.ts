import { Request, Response } from "express"

import api from "../../api";

export async function retrieveBrokerageDealProfileAccesses(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    console.log('retrieveBrokerageDealProfileAccesses:', brokerage_id, deal_id)
    const response = await api.get(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'retrieveBrokerageDealProfileAccesses error:' + err })
  }
}

export async function retrieveBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id, profile_access_id } = req.params
    console.log('retrieveBrokerageDealProfileAccess:', brokerage_id, deal_id, profile_access_id)
    const response = await api.get(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'retrieveBrokerageDealProfileAccess error:' + err })
  }
}

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

export async function deleteBrokerageDealProfileAccess(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id, profile_access_id } = req.params
    console.log('deleteBrokerageDealProfileAccess:', brokerage_id, deal_id, profile_access_id)
    const response = await api.delete(`/brokerages/${brokerage_id}/deals/${deal_id}/accesses/${profile_access_id}`);
    // console.log('deleteBrokerageDealProfileAccess response:', response)
    return res.status(response.status)
  } catch (err) {
    res.status(500).json({ error: 'deleteBrokerageDealProfileAccess error:' + err })
  }
}