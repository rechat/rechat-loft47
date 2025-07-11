import { Request, Response } from 'express'
import axios from 'axios'

import 'express-session'        // keep this line

declare module 'express-session' {
  interface SessionData {
    token?: string;             // <-- custom field
  }
}

export async function retrieveBrokerages(req: Request, res: Response) {

  try {
    const API_URL = process.env.STAGING_LOFT47_API_URL
    // Make request to external API
    const response = await axios.get(API_URL + '/brokerages',
      {
        headers: {
          'authorization': req.session.token
        }
      }
    );

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
