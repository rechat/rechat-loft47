import { Request, Response } from "express"

import api from "../../api";


export async function getBrokerageProfiles(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const { agent_email } = req.query
    const response = await api.get(`/brokerages/${brokerage_id}/profiles`, {
      params: {
        'filter[email][in]': agent_email
      }
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'getBrokerageProfiles error:' + err })
  }
}

export async function createBrokerageProfile(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    console.log('createBrokerageProfile req.body:', req.body)
    const response = await api.post(`/brokerages/${brokerage_id}/profiles`, req.body)
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'createBrokerageProfile error:' + err })
  }
}

export async function getBrokerageProfile(req: Request, res: Response) {
  try {
    const { brokerage_id, profile_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/profiles/${profile_id}`)
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'getBrokerageProfile error:' + err })
  }
}

export async function updateBrokerageProfile(req: Request, res: Response) {
  try {
    const { brokerage_id, profile_id } = req.params
    const response = await api.patch(`/brokerages/${brokerage_id}/profiles/${profile_id}`, req.body)
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'updateBrokerageProfile error:' + err })
  }
}