import { Request, Response } from "express"

import api from "../../api";


export async function getBrokerageDeals(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/deals`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'getBrokerageDeals error:' + err })
  }
}

export async function getBrokerageDeal(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    console.log('getBrokerageDeal:', brokerage_id, deal_id)
    const response = await api.get(`/brokerages/${brokerage_id}/deals/${deal_id}`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'getBrokerageDeal error:' + err })
  }
}

export async function createDeal(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    console.log('createDeal:', brokerage_id, req.body)
    const response = await api.post(`/brokerages/${brokerage_id}/deals`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'createDeal error:' + err })
  }
}

export async function updateBrokerageDeal(req: Request, res: Response) {
  try {
    const { brokerage_id, deal_id } = req.params
    console.log('updateBrokerageDeal:', brokerage_id, deal_id, req.body)
    const response = await api.patch(`/brokerages/${brokerage_id}/deals/${deal_id}`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'updateBrokerageDeal error:' + err })
  }
}