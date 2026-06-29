import { NextResponse } from "next/server";
import { authConfig, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (
    body.email !== authConfig.email ||
    body.password !== authConfig.password
  ) {
    return NextResponse.json(
      { error: "Thông tin đăng nhập không hợp lệ." },
      { status: 401 },
    );
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    authConfig.cookieName,
    createSessionToken(authConfig.email),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: authConfig.maxAge,
      path: "/",
    },
  );
  return response;
}
