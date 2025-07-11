import { Request, Response } from 'express'
import api, { setBearerToken } from '../../api'

import 'express-session'        // keep this line

declare module 'express-session' {
  interface SessionData {
    token?: string;
  }
}

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

    const authHeader = response.headers['authorization'];
    let token: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    setBearerToken(token as string);
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
