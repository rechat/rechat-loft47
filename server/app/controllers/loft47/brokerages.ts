import { Request, Response } from 'express'

import api, { handleAxiosError } from '../../api'

export async function retrieveBrokerages(req: Request, res: Response) {
  try {
    const response = await api.get('/brokerages', {
      headers: {
        'x-session-token': api.defaults.headers.common['x-session-token']
      }
    })

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function createBrokerage(req: Request, res: Response) {
  try {
    const response = await api.post('/brokerages', req.body)

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function getBrokerage(req: Request, res: Response) {
  try {
    const response = await api.get(`/brokerages/${req.params.id}`)

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function updateBrokerage(req: Request, res: Response) {
  try {
    const response = await api.patch(`/brokerages/${req.params.id}`, req.body)

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}

export async function deleteBrokerage(req: Request, res: Response) {
  try {
    const response = await api.delete(`/brokerages/${req.params.id}`)

    return res.status(response.status).json(response.data)
  } catch (err: any) {
    const error = handleAxiosError(err)

    return res.status(error.status).json({ error: error.message })
  }
}
