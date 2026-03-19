import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config with a development proxy so requests to /api are forwarded to Django
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Vitest config omitted from Vite config file to avoid type issues in this project.
});
