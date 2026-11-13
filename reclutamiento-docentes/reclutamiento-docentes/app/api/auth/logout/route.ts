import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/config";

export async function POST() {
  const res = NextResponse.redirect(new URL("/login", baseUrl()), 303);
  res.cookies.delete("sess");
  return res;
}
