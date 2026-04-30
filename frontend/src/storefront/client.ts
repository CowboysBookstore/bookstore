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

/**
 * A consolidated API object for making requests to the backend.
 * It uses the configured `apiClient` (axios instance).
 */
export const api = {
  // Auth
  register: (body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => apiClient.post("/api/auth/register/", body).then((res) => res.data),

  verify: (body: { email: string; code: string }) =>
    apiClient.post("/api/auth/verify/", body).then((res) => res.data),

  login: (body: { email: string; password: string }) =>
    apiClient.post<{ access: string; refresh: string }>("/api/auth/login/", body).then((res) => res.data),

  forgotPassword: (body: { email: string }) =>
    apiClient.post("/api/auth/forgot-password/", body).then((res) => res.data),

  resetPassword: (body: { email: string; code: string; new_password: string }) =>
    apiClient.post("/api/auth/reset-password/", body).then((res) => res.data),

  // Products
  listProducts: () => apiClient.get("/api/products/").then((res) => res.data),
};