import axios from "axios";
import { getTokens } from "./auth/auth";
import { config } from "./config";

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (c) => {
  const token = await getTokens();

  if (token && token?.accessToken) {
    c.headers.Authorization = `Bearer ${token.accessToken}`;
  }

  return c;
});

export default api;
