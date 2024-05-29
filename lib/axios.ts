"use server";

import axios from "axios";
import { config } from "./config";
import { getAccessToken } from "./auth";

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  console.log("api.interceptors.request", config.url);
  if (config.url?.includes("/auth")) return config;
  const { accessToken } = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
