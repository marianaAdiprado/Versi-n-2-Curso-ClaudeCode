import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cfg } from "./config";

export type Role = "coordinadora" | "director";
export type Session = { email: string; roles: Role[] };

const key = () => {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 16) throw new Error("APP_SECRET falta o es muy corto");
  return new TextEncoder().encode(s);
};

export function rolesFor(email: string): Role[] {
  const e = email.toLowerCase();
  const c = cfg();
  const roles: Role[] = [];
  if (c.coordinadoras.includes(e)) roles.push("coordinadora");
  if (c.directores.includes(e)) roles.push("director");
  return roles;
}

export async function createSessionToken(email: string, roles: Role[]) {
  return new SignJWT({ email, roles })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(key());
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const t = jar.get("sess")?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return { email: String(payload.email), roles: (payload.roles as Role[]) ?? [] };
  } catch {
    return null;
  }
}

// ── Enlaces únicos para candidatos ─────────────────────────────────────
export async function signCandidateToken(id: string) {
  return new SignJWT({ cid: id }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("90d").sign(key());
}

export async function verifyCandidateToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.cid === "string" ? payload.cid : null;
  } catch {
    return null;
  }
}
