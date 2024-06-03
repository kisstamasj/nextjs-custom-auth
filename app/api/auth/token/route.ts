import { config } from "@/lib/config";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: NextApiRequest) {
  const accessToken = cookies().get("accessToken")?.value;
  const refreshToken = cookies().get("refreshToken")?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({
      message: "Unauthorized",
    });
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${config.API_URL}/users/profile`, {
    headers: headers,
  });

  if (res.status === 401) {
    console.log("refreshing token");
    const res = await fetch(`${config.API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const jsonData = await res.json();

    if (res.ok) {
      const response = NextResponse.json({
        accessToken: jsonData.accessToken,
        refreshToken: jsonData.refreshToken,
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

      console.log("Tokens refresh successfully");

      return response;
    }

    const response = NextResponse.json({
      message: "Tokens refresh not successfully",
    });

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }

  const response = NextResponse.json({
    accessToken: accessToken,
    refreshToken: refreshToken,
  });

  return response;
}
