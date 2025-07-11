import { Request, Response } from 'express'

import api from '../../api';

export async function retrieveBrokerages(req: Request, res: Response) {
  try {
    const response = await api.get('/brokerages');
    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Error in retrieveBrokerages:', error.message);

    // Forward error from backend or a fallback message
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export async function createBrokerage(req: Request, res: Response) {
  try {
    const response = await api.post('/brokerages', req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error in createBrokerage:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getBrokerage(req: Request, res: Response) {
  try {
    const response = await api.get(`/brokerages/${req.params.id}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error in getBrokerage:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateBrokerage(req: Request, res: Response) {
  try {
    const response = await api.patch(`/brokerages/${req.params.id}`, req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error in updateBrokerage:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteBrokerage(req: Request, res: Response) {
  try {
    const response = await api.delete(`/brokerages/${req.params.id}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error in deleteBrokerage:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}