import { Request, Response } from 'express'
import axios from 'axios'

import 'express-session'        // keep this line

declare module 'express-session' {
  interface SessionData {
    token?: string;
  }
}

export async function signIn(req: Request, res: Response) {
  const { user } = req.body || {}

  try {
    const API_URL = process.env.STAGING_LOFT47_API_URL
    // Make request to external API
    const response = await axios.post(API_URL + '/sign_in', 
      {
        user
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Forward response data back to client
    req.session.token = response.headers['authorization'];
    await new Promise(r => req.session.save(r))

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
