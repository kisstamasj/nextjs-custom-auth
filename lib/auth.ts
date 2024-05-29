"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_LOGOUT_REDIRECT,
  authRoutes,
} from "./routes-rules";
import api from "./axios";
import { cookies } from "next/headers";
import { AuthSchemaType } from "@/schemas/auth";
import { AxiosError } from "axios";
import { config } from "./config";

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
    sameSite: "strict",
    secure: false,
  });

  cookies().set({
    name: "refreshToken",
    value: request.refreshToken,
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
}

export async function removeToken() {
  cookies().delete("accessToken");
  cookies().delete("refreshToken");
}

export async function getAccessToken() {
  console.log("getAccessToken");
  console.log(config.APP_URL);
  const respone = await fetch(`${config.APP_URL}/api/auth/token`, {
    method: "GET",
    headers: {
      "cache-control": "no-cache",
    },
  });

  const data = await respone.json();
  return data;
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

export async function authorized(request: NextRequest) {
  const accessToken = await getAccessToken();
  const loggedIn = !!accessToken;
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);

  if (!loggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGOUT_REDIRECT, request.url));
  }

  if (loggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  return NextResponse.next();
}
