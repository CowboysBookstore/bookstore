const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
  }) => request<{ detail: string }>("/api/auth/register/", body),

  verify: (body: { email: string; code: string }) =>
    request<{ detail: string }>("/api/auth/verify/", body),

  login: (body: { email: string; password: string }) =>
    request<{ access: string; refresh: string }>("/api/auth/login/", body),

  forgotPassword: (body: { email: string }) =>
    request<{ detail: string }>("/api/auth/forgot-password/", body),

  resetPassword: (body: { email: string; code: string; new_password: string }) =>
    request<{ detail: string }>("/api/auth/reset-password/", body),
};
