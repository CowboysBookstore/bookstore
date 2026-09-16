import axios from "axios";

declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string;
    };
  }
}

const rawApiBaseUrl =
  window.__APP_CONFIG__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

const baseURL = rawApiBaseUrl.replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "bookstore.access";
const REFRESH_TOKEN_KEY = "bookstore.refresh";
export const AUTH_CHANGED_EVENT = "bookstore-auth-changed";

export function setAuthTokens(access: string, refresh: string) {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, access);
  window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuthTokens() {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function isSignedIn() {
  return Boolean(window.sessionStorage.getItem(ACCESS_TOKEN_KEY));
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const firstField = data && typeof data === "object" ? Object.keys(data)[0] : null;
    const fieldMessage = firstField ? data[firstField] : null;
    const message =
      (typeof data?.detail === "string" && data.detail) ||
      (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) ||
      (Array.isArray(fieldMessage) && fieldMessage[0]) ||
      (typeof fieldMessage === "string" && fieldMessage) ||
      (error.code === "ECONNABORTED"
        ? "The bookstore server took too long to respond. Please try again."
        : "The bookstore server could not complete that request.");

    error.message = message;
    return Promise.reject(error);
  },
);

export const api = {
  register: (body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) =>
    apiClient
      .post<{ detail: string; activation_required: boolean }>(
        "/api/auth/register/",
        body,
      )
      .then((response) => response.data),

  verify: (body: { email: string; code: string }) =>
    apiClient.post("/api/auth/verify/", body).then((response) => response.data),

  login: (body: { email: string; password: string }) =>
    apiClient
      .post<{ access: string; refresh: string }>("/api/auth/login/", body)
      .then((response) => response.data),

  forgotPassword: (body: { email: string }) =>
    apiClient
      .post<{ detail: string; reset_code?: string }>(
        "/api/auth/forgot-password/",
        body,
      )
      .then((response) => response.data),

  resetPassword: (body: {
    email: string;
    code: string;
    new_password: string;
  }) =>
    apiClient
      .post("/api/auth/reset-password/", body)
      .then((response) => response.data),

  listProducts: () =>
    apiClient.get("/api/products/").then((response) => response.data),

  listOrders: () =>
    apiClient.get("/api/products/orders/").then((response) => response.data),
};
