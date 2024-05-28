"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_LOGOUT_REDIRECT,
  authRoutes,
} from "./routes-rules";
import axiosInstance from "./axios";
import { cookies } from "next/headers";
import { AuthSchemaType } from "@/schemas/auth";
import { AxiosError } from "axios";

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
    const { data } = await axiosInstance.get<Profile>("/users/profile");
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
    secure: true,
  });

  cookies().set({
    name: "refreshToken",
    value: request.refreshToken,
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });
}

export async function removeToken() {
  cookies().delete("accessToken");
  cookies().delete("refreshToken");
}

export async function getTokens() {
  const accessToken = cookies().get("accessToken")?.value;
  const refreshToken = cookies().get("refreshToken")?.value;
  if (!accessToken || !refreshToken) {
    return { accessToken: null, refreshToken: null };
  }
  return { accessToken, refreshToken };
}

export async function signInAction(
  authSchema: AuthSchemaType,
  userAgent: string
) {
  try {
    const { email, password } = authSchema;
    const { data } = await axiosInstance.post<SignInResponse>(
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
  await axiosInstance.get("/auth/logout");
  await removeToken();
}

export async function authorized(request: NextRequest) {
  const { accessToken } = await getTokens();
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
