import { config } from "@/lib/config";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: NextApiRequest) {
  console.log("api/auth/token");

  const accessToken = cookies().get("accessToken")?.value;
  const refreshToken = cookies().get("refreshToken")?.value;

  console.log(accessToken, refreshToken);

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${config.API_URL}/users/profile`, {
    headers: headers,
  });

  if (res.status === 401) {
    const refreshPayload = {
      refreshToken,
    };
    const res = await fetch(`${config.API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshPayload.refreshToken}`,
      },
    });

    const jsonData = await res.json();

    console.log("refreshToken res", jsonData);

    if (res.ok) {
      const response = NextResponse.json({
        message: "Tokens refreshed successfully",
      });
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

      return response;
    }

    const response = NextResponse.json({
      message: "Tokens refresh not successfully",
    });

    return response;
  }

  const response = NextResponse.json({
    accessToken: accessToken,
    refreshToken: refreshToken,
  });

  return response;
}
