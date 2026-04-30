import axios from "axios";

// Automatically use the VITE_API_BASE_URL from your .env file or Render environment.
// If it's not set (like in local dev), it defaults to the Vite proxy path.
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// This "interceptor" automatically adds the JWT token to every outgoing request
// if the user is logged in. This is much cleaner than adding it manually everywhere.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});