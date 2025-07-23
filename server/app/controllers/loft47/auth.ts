import { Request, Response } from 'express'
import api from '../../api'

import 'express-session'        // keep this line

declare module 'express-session' {
  interface SessionData {
    token?: string;
  }
}

let bearerToken: string | null = null;

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    if (bearerToken) {
      config.headers.Authorization = bearerToken;
      config.headers.Accept = 'application/vnd.api+json';
    }
    console.log('--------------------------------')
    console.log('URL:', config.url)
    console.log('Method:', config.method)
    console.log('Params:', config.params)
    console.log('Data:', config.data)
    console.log('Authorization:', config.headers.Authorization)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function signIn(req: Request, res: Response) {
  const { user } = req.body || {}

  try {
    // Make request to external API
    const response = await api.post('/sign_in', 
      {
        user
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    bearerToken = response.headers['authorization'];

    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Error logging in:', error.message);

    // Forward error from backend or a fallback message
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
