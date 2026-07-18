import { NextRequest, NextResponse } from "next/server";
import { checkPassword, makeToken, ADMIN_COOKIE } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!checkPassword(password ?? "")) {
    return NextResponse.json({ ok: false, error: "bad_password" }, { status: 401 });
  }
  const { value, maxAge } = makeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
