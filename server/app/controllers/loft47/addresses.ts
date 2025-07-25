import { Request, Response } from "express"

import api, { handleAxiosError } from "../../api";

export async function retrieveAddress(req: Request, res: Response) {
  try {
    const { address_id } = req.params
    const response = await api.get(`/addresses/${address_id}`);
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}

export async function updateAddress(req: Request, res: Response) {
  try {
    const { address_id } = req.params
    const response = await api.patch(`/addresses/${address_id}`, req.body);
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const error = handleAxiosError(err)
    return res.status(error.status).json({ error: error.message })
  }
}