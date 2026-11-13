import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { oauthClient } from "@/lib/google";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const url = oauthClient().generateAuthUrl({
    scope: ["openid", "email"],
    state,
    prompt: "select_account",
  });
  const res = NextResponse.redirect(url);
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
