"use server";

import { AuthSchemaType } from "@/schemas/auth";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import api from "../axios";

export interface Profile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignInResponse {
  user: Profile;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export async function getProfile() {
  try {
    const { data } = await api.get<Profile>("/users/profile");
    return data;
  } catch (error) {
    return null;
  }
}

export async function storeToken(tokens: AuthTokens) {
  cookies().set({
    name: "accessToken",
    value: tokens.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  cookies().set({
    name: "refreshToken",
    value: tokens.refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getTokens() {
  const accessToken = cookies().get("accessToken")?.value;
  const refreshToken = cookies().get("refreshToken")?.value;
  if (!accessToken || !refreshToken) {
    return null;
  }
  return { accessToken, refreshToken };
}

export async function removeToken() {
  cookies().delete("accessToken");
  cookies().delete("refreshToken");
}

export async function signInWithCredentials(
  authSchema: AuthSchemaType,
  userAgent: string
) {
  try {
    const { email, password } = authSchema;
    const { data } = await api.post<SignInResponse>(
      "/auth/signin",
      {
        email,
        password,
      },
      {
        headers: {
          "User-Agent": userAgent,
        },
      }
    );

    await storeToken(data.tokens);
    if (data.user) {
      return data.user;
    }
    return null;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }

    return null;
  }
}

export async function signOutAction() {
  try {
    await api.get("/auth/logout");
  } catch (error) {}

  await removeToken();
}
