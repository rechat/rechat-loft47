import { Request, Response } from "express"

import api from "../../api";

export async function retrieveAddress(req: Request, res: Response) {
  try {
    const { address_id } = req.params
    const response = await api.get(`/addresses/${address_id}`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'retrieveAddress error:' + err })
  }
}

export async function updateAddress(req: Request, res: Response) {
  try {
    const { address_id } = req.params
    const response = await api.patch(`/addresses/${address_id}`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'updateAddress error:' + err })
  }
}