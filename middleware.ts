import { NextRequest, NextResponse } from "next/server";
import { StoreTokenRequest, authorized } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    console.log("refreshing token");
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    const jsonData = (await refreshRes.json()) as StoreTokenRequest;
    if (refreshRes.ok) {
      response.cookies.set("accessToken", jsonData.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      response.cookies.set("refreshToken", jsonData.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  await authorized(request);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
