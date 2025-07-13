import axios from 'axios';

const API_URL = process.env.STAGING_LOFT47_API_URL

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL, // Your backend URL
  withCredentials: true             // Required for cookie/session-based auth
});

export default api;