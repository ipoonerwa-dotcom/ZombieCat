import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "zc_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.ADMIN_SECRET || "dev-admin-secret-change-me";
}
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "zombiescat-admin";
}

function sign(exp: number): string {
  return crypto.createHmac("sha256", secret()).update(`zc-admin|${exp}`).digest("base64url");
}

export function checkPassword(pw: string): boolean {
  const a = Buffer.from(pw || "");
  const b = Buffer.from(adminPassword());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function makeToken(): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return { value: `${exp}.${sign(exp)}`, maxAge: MAX_AGE };
}

export function verifyToken(token?: string): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig || "");
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export const ADMIN_COOKIE = COOKIE;
