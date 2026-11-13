import { NextRequest, NextResponse } from "next/server";
import { oauthClient } from "@/lib/google";
import { baseUrl } from "@/lib/config";
import { createSessionToken, rolesFor } from "@/lib/session";

export async function GET(req: NextRequest) {
  const go = (path: string) => NextResponse.redirect(new URL(path, baseUrl()));
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state || state !== req.cookies.get("oauth_state")?.value) return go("/login?error=sesion");
  try {
    const client = oauthClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token!, audience: process.env.GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    const email = p?.email?.toLowerCase();
    if (!email || !p?.email_verified) return go("/login?error=sesion");
    const roles = rolesFor(email);
    if (!roles.length) return go("/login?error=sin-acceso");
    const res = go("/admin");
    res.cookies.set("sess", await createSessionToken(email, roles), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 3600,
      path: "/",
    });
    res.cookies.delete("oauth_state");
    return res;
  } catch {
    return go("/login?error=sesion");
  }
}
