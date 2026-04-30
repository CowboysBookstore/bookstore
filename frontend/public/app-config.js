// Runtime configuration for the deployed static frontend.
//
// How to use:
// - Override this file at deploy time (or edit it in the deployed artifact) to
//   repoint the frontend to a different backend without rebuilding.
//
// IMPORTANT:
// - Do NOT put secrets here. This file is publicly served.
//
// Example:
//   window.__APP_CONFIG__ = { API_BASE_URL: "https://bookstore-backend-zv33.onrender.com" };

window.__APP_CONFIG__ = {
  // Default is empty so the app falls back to VITE_API_BASE_URL or localhost.
  // API_BASE_URL: "https://bookstore-backend.onrender.com",
};
