import { NextResponse } from "next/server";
import { baseUrl, cfg, convocatoriaStatus } from "@/lib/config";
import { prefiltro } from "@/lib/prefiltro";
import { addCandidate, listCandidates, updateCandidate } from "@/lib/sheet";
import { createCandidateFolder } from "@/lib/drive";
import { signCandidateToken } from "@/lib/session";
import { isEmail, sendMail } from "@/lib/mail";
import { mail } from "@/lib/emails";
import { ESTADOS } from "@/lib/types";

export const maxDuration = 30;

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return bad("Solicitud inválida.");
  }
  if (b.web) return NextResponse.json({ ok: true, cumple: false }); // honeypot anti-spam

  if (!convocatoriaStatus().abierta) return bad("La convocatoria no está abierta.", 403);

  const c = cfg();
  const nombre = String(b.nombre ?? "").trim().replace(/\s+/g, " ");
  const email = String(b.email ?? "").trim().toLowerCase();
  const telefono = String(b.telefono ?? "").trim();
  const maestria = String(b.maestria ?? "");
  const regimen = String(b.regimen ?? "");
  const yes = (v: unknown) => v === true || v === "si";

  if (nombre.length < 3 || nombre.length > 120) return bad("Escribe tu nombre completo.");
  if (!isEmail(email) || email.length > 160) return bad("Escribe un correo válido.");
  if (!/^[0-9+()\-\s]{8,20}$/.test(telefono)) return bad("Escribe un teléfono válido.");
  if (!c.maestrias.includes(maestria)) return bad("Selecciona una maestría.");
  if (!b.privacidad) return bad("Debes aceptar el aviso de privacidad.");
  if (!regimen) return bad("Selecciona tu régimen fiscal.");

  const existentes = await listCandidates();
  if (existentes.some((x) => x.convocatoria === c.convocatoriaId && x.email.toLowerCase() === email)) {
    return bad("Ya existe un registro con este correo en la convocatoria actual. Solo se puede aplicar a una maestría.", 409);
  }

  const motivos = prefiltro({
    tituloMaestria: yes(b.tituloMaestria),
    expVirtual: yes(b.expVirtual),
    resideCdmx: yes(b.resideCdmx),
    regimen,
  });
  const base = {
    convocatoria: c.convocatoriaId,
    nombre,
    email,
    telefono,
    maestria,
    doctorado: yes(b.doctorado) ? "Sí" : "No",
    regimen,
  };

  if (motivos.length) {
    await addCandidate({ ...base, estado: ESTADOS.DESCARTADO, motivo: motivos.join("; ") });
    const m = mail.descarte(nombre);
    await sendMail(email, m.subject, m.html);
    return NextResponse.json({ ok: true, cumple: false });
  }

  const cand = await addCandidate({ ...base, estado: ESTADOS.PENDIENTE_DOCS });
  const folder = await createCandidateFolder(c.convocatoriaId, maestria, nombre, cand.id);
  await updateCandidate(cand.id, { carpetaId: folder.id, carpetaUrl: folder.url });
  const link = `${baseUrl()}/subir/${await signCandidateToken(cand.id)}`;
  const m = mail.registro(nombre, link);
  await sendMail(email, m.subject, m.html);
  return NextResponse.json({ ok: true, cumple: true, next: link });
}
