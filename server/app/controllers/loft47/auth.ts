import { Request, Response } from 'express'
import api from '../../api'

import 'express-session'        // keep this line

declare module 'express-session' {
  interface SessionData {
    token?: string;
  }
}

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = (config as any).headers['x-session-token'];
    if (token) {
      config.headers.Authorization = token;
      config.headers.Accept = 'application/vnd.api+json';
    }
    console.log('--------------------------------')
    console.log('URL:', config.url)
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

    const token = response.headers['authorization'];
    if (token) {
      // Persist token for subsequent outbound requests made through the shared axios instance
      api.defaults.headers.common['x-session-token'] = token;
    }

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
