import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "vinmec_admin";
const ONE_WEEK = 60 * 60 * 24 * 7;

function secret() {
  return process.env.AUTH_SECRET || "vinmec-local-development-secret";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      expiresAt: Date.now() + ONE_WEEK * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return null;
  const [payload, receivedSignature] = token.split(".");
  if (!payload || !receivedSignature) return null;
  const expected = signature(payload);
  if (
    receivedSignature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { email: string; expiresAt: number };
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export const authConfig = {
  cookieName: COOKIE_NAME,
  maxAge: ONE_WEEK,
  email: process.env.ADMIN_EMAIL || "admin@vinmec.vn",
  password: process.env.ADMIN_PASSWORD || "admin123",
};
