import axios from "axios";

// Create axios instance for legacy backend (kept for backward compatibility)
export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Quadrakill (preferred) unified backend
export const quadrakillApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Optional: Add request/response interceptors if needed
// backendApi.interceptors.request.use(
//   (config) => {
//     // Add auth token or other headers here
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// backendApi.interceptors.response.use(
//   (response) => response,
//   (error) => Promise.reject(error)
// );
