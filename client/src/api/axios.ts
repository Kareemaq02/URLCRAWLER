import { API_BASE_URL } from "./config";
import axios from "axios";

/**
 * Axios instance configured with base URL and auth token interceptor.
 */
const instance = axios.create({
  baseURL: API_BASE_URL, // Base URL for all requests from config
});

/**
 * Request interceptor to attach Bearer token from localStorage if present.
 * This adds the Authorization header for authenticated requests.
 */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Attach token as Bearer token in Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
