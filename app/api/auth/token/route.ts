import { config } from "@/lib/config";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("api/auth/token");

  const accessToken = cookies().get("accessToken")?.value;
  console.log(accessToken);
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${config.API_URL}/users/profile`, {
    headers: headers,
  });

  if (res.status === 401) {
    const refreshPayload = {
      refreshToken: cookies().get("refreshToken")?.value,
    };
    const res = await fetch(`${config.API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshPayload.refreshToken}`,
      },
    });

    const jsonData = await res.json();

    cookies().set({
      name: "accessToken",
      value: jsonData.accessToken,
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    cookies().set({
      name: "refreshToken",
      value: jsonData.refreshToken,
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
  }
  const resData = {
    accessToken: cookies().get("accessToken")?.value,
  };

  return Response.json(resData);
}
