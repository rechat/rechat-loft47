import { Request, Response } from 'express'

import api from '../../api';

export async function retrieveBrokerages(req: Request, res: Response) {
  try {
    const response = await api.get('/brokerages');
    console.log('retrieveBrokerages / authorization:', response.headers['authorization']);
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
