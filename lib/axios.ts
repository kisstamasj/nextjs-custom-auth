"use server";

import axios from "axios";
import { config } from "./config";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (c) => {
  if (c.url?.includes("/auth")) return c;
  const token = await getToken();
  if (token?.accessToken) {
    c.headers.Authorization = `Bearer ${token.accessToken}`;
  }

  return c;
});

export default api;
