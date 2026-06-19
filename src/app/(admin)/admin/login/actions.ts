"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@prvy.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin2024";

export async function adminLogin(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const email    = (formData.get("email")    as string ?? "").trim();
  const password = (formData.get("password") as string ?? "").trim();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return { error: "Invalid email or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("prvy-admin-session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin/dashboard");
}
