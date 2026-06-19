import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@prvy.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin2024";
const COOKIE_NAME    = "prvy-admin-session";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
