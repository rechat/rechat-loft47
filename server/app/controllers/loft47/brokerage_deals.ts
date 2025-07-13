import { Request, Response } from "express"

import api from "../../api";


export async function getBrokerageDeals(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/deals`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}