export const TZ = "America/Mexico_City";

export function cfg() {
  return {
    institucion: process.env.INSTITUCION || "Instituto Universitario del Prado (UdelPrado)",
    convocatoriaId: process.env.CONVOCATORIA_ID || "2026-1",
    convocatoriaNombre: process.env.CONVOCATORIA_NOMBRE || "Convocatoria docente · Maestrías",
    maestrias: (process.env.MAESTRIAS || "Maestría 1|Maestría 2|Maestría 3")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean),
    meta: Number(process.env.META_POR_MAESTRIA || 5),
    coordinadoras: list(process.env.COORDINADORA_EMAILS),
    directores: list(process.env.DIRECTOR_EMAILS),
  };
}

function list(v?: string) {
  return (v || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function baseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function todayMx() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function convocatoriaStatus(): { abierta: boolean; razon?: "aun-no" | "cerrada" } {
  const hoy = todayMx();
  const ini = process.env.CONVOCATORIA_APERTURA?.trim();
  const fin = process.env.CONVOCATORIA_CIERRE?.trim();
  if (ini && hoy < ini) return { abierta: false, razon: "aun-no" };
  if (fin && hoy > fin) return { abierta: false, razon: "cerrada" };
  return { abierta: true };
}

export function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeStyle: "short", timeZone: TZ }).format(new Date(iso));
}
export function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: TZ }).format(new Date(iso));
}

/** Días hábiles (lunes a viernes) transcurridos desde `iso`. No considera festivos. */
export function businessDaysSince(iso: string, now = new Date()) {
  let d = new Date(iso);
  let n = 0;
  for (;;) {
    d = new Date(d.getTime() + 86400000);
    if (d > now) break;
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) n++;
  }
  return n;
}
