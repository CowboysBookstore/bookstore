declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string;
    };
  }
}

const RAW_API_BASE_URL =
  window.__APP_CONFIG__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

// Ensure we don't end up with double slashes when concatenating.
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

async function request<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const method = opts.method ?? "POST";
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again later.");
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Something went wrong. Please try again later.");
  }

  const data = await res.json();
  if (!res.ok) {
    let msg = "Something went wrong. Please try again.";
    if (typeof data.detail === "string") msg = data.detail;
    else if (Array.isArray(data.non_field_errors)) msg = data.non_field_errors[0];
    else {
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey])) msg = data[firstKey][0];
    }
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  register: (body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => request<{ detail: string }>("/api/auth/register/", { body }),

  verify: (body: { email: string; code: string }) =>
    request<{ detail: string }>("/api/auth/verify/", { body }),

  login: (body: { email: string; password: string }) =>
    request<{ access: string; refresh: string }>("/api/auth/login/", { body }),

  forgotPassword: (body: { email: string }) =>
    request<{ detail: string }>("/api/auth/forgot-password/", { body }),

  resetPassword: (body: { email: string; code: string; new_password: string }) =>
    request<{ detail: string }>("/api/auth/reset-password/", { body }),

  // Products
  listProducts: () =>
    request<unknown>("/api/products/", {
      method: "GET",
    }),
};
