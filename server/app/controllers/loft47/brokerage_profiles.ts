import { Request, Response } from "express"

import api from "../../api";


export async function getBrokerageProfiles(req: Request, res: Response) {
  try {
    const { brokerage_id } = req.params
    const response = await api.get(`/brokerages/${brokerage_id}/profiles`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'getBrokerageProfiles error:' + err })
  }
}