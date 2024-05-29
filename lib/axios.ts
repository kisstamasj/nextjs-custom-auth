"use server";

import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  console.log("api.interceptors.request", config.url);
  if (config.url?.includes("/auth")) return config;
  const respone = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/token`,
    {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    }
  );

  const data = await respone.json();
  if (data.accessToken) {
    config.headers.Authorization = `Bearer ${data.accessToken}`;
  }
  return config;
});

export default api;
