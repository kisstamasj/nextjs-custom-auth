import { SignInResponse } from "@/lib/auth/auth";
import api from "@/lib/axios";
import { NextResponse, userAgent } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const ua = userAgent(request);
  const { data } = await api.post<SignInResponse>(
    "/auth/signin",
    {
      email,
      password,
    },
    {
      headers: {
        "User-Agent": JSON.stringify(ua),
      },
    }
  );

  const response = NextResponse.json({ message: "Logged in successfully" });
  response.cookies.set("accessToken", data.tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  response.cookies.set("refreshToken", data.tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
