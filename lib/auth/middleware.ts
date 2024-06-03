import { NextRequest, NextResponse } from "next/server";
import { LOGIN_PAGE, REDIRECT_AFTER_LOGIN, AUTH_ROUTES } from "../routes-rules";
import { StoreTokenRequest } from "./auth";

export async function authMiddleware(request: NextRequest) {
  let response = NextResponse.next();
  const { accessToken, refreshToken } = getTokens(request);
  const loggedIn = !!refreshToken;
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.includes(pathName);

  if (!loggedIn && !isAuthRoute) {
    return forceLogout(request);
  }

  if (loggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(REDIRECT_AFTER_LOGIN, request.url));
  }

  // logged in user need token rotation
  if (loggedIn && !isAuthRoute) {
    if (!(await isValidAccessToken(accessToken))) {
      const newTokens = await refreshTokens(refreshToken);
      if (!newTokens) {
        return forceLogout(request);
      }

      return storeToken(newTokens, request);
    }
  }

  return response;
}

function getTokens(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  return { accessToken, refreshToken };
}

function forceLogout(request: NextRequest) {
  request.cookies.delete("accessToken");
  request.cookies.delete("refreshToken");
  let response = NextResponse.redirect(new URL(LOGIN_PAGE, request.url), {
    headers: request.headers,
  });

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}

function storeToken(tokens: StoreTokenRequest, request: NextRequest) {
  let response = NextResponse.next();
  request.cookies.set("accessToken", tokens.accessToken);
  request.cookies.set("refreshToken", tokens.refreshToken);

  // updated request cookies can only be passed to server if its passdown here after setting its updates
  response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  response.cookies.set("accessToken", tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  response.cookies.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

async function isValidAccessToken(accessToken: string | undefined) {
  if (!accessToken) return false;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403 || !res.ok) {
    return false;
  }

  return true;
}

async function refreshTokens(refreshToken: string | undefined) {
  if (!refreshToken) return null;

  const refreshRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      cache: "no-store",
    }
  );
  const jsonData = (await refreshRes.json()) as StoreTokenRequest;

  if (refreshRes.ok) {
    return jsonData;
  }

  return null;
}
