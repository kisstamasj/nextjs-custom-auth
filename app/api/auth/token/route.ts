import { config } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  console.log("api/auth/token");
  const accessToken = cookies().get("accessToken")?.value;
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${config.API_URL}/users/profile`, {
    headers: headers,
  });

  if (response.status === 401) {
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

  return new Response(JSON.stringify(resData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
