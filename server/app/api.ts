import axios, { AxiosError } from 'axios'

const API_URL = process.env.LOFT47_API_URL

type APIError = {
  status: number
  message: string
  data?: any
}

export function handleAxiosError(error: unknown): APIError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500
    const message =
      error.response?.data ||
      error.response?.statusText ||
      error.message ||
      'Unexpected Axios error'

    return {
      status,
      message
    }
  }

  // Fallback for non-Axios errors
  return {
    status: 500,
    message: error instanceof Error ? error.message : String(error),
  }
}

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export default api;