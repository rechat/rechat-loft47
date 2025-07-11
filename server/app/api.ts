import axios from 'axios';

const API_URL = process.env.STAGING_LOFT47_API_URL

export let bearerToken: string | null = null;

export function setBearerToken(token: string | null) {
  bearerToken = token;
}

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL, // Your backend URL
  withCredentials: true             // Required for cookie/session-based auth
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token'); // or sessionStorage, or from context

    if (bearerToken) {
      config.headers.Authorization = bearerToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;