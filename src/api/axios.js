import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5007/api" || "/api",
  baseURL: "https://ref-recovery.onrender.com/api" || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledger_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
