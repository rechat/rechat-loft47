import axios from 'axios';

const API_URL = process.env.LOFT47_API_URL

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export default api;