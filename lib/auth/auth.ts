"use server";

import { AuthSchemaType } from "@/schemas/auth";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import api from "../axios";
import { LOGIN_PAGE, REDIRECT_AFTER_LOGIN } from "../routes-rules";

export interface Profile {
  id: string;
  email: string;
  name: string;
}

export interface StoreTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface SignInResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
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

export async function storeToken(request: StoreTokenRequest) {
  cookies().set({
    name: "accessToken",
    value: request.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  cookies().set({
    name: "refreshToken",
    value: request.refreshToken,
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

    return data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
  }
}

export async function signOutAction() {
  try {
    await api.get("/auth/logout");
  } catch (error) {}

  await removeToken();
}
