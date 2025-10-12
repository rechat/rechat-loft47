import axios, { AxiosInstance } from 'axios'

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
    message: error instanceof Error ? error.message : String(error)
  }
}

// Create an Axios instance for a specific API URL
export function createApiInstance(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

// Create authenticated instance with token
export function createAuthenticatedApiInstance(baseURL: string, token: string): AxiosInstance {
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token
    }
  })
}
