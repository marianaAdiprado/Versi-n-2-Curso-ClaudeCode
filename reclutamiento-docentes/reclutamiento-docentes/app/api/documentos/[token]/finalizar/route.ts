import { NextResponse } from "next/server";
import { baseUrl, cfg } from "@/lib/config";
import { candidateFromToken } from "@/lib/candidate";
import { listDocs } from "@/lib/drive";
import { updateCandidate } from "@/lib/sheet";
import { sendMail } from "@/lib/mail";
import { mail } from "@/lib/emails";
import { DOCS, ESTADOS } from "@/lib/types";

export const maxDuration = 30;

export async function POST(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const c = await candidateFromToken(token);
  if (!c) return NextResponse.json({ error: "Enlace inválido o vencido." }, { status: 401 });
  if (c.estado !== ESTADOS.PENDIENTE_DOCS && c.estado !== ESTADOS.CORRECCION)
    return NextResponse.json({ error: "Tu expediente ya no admite cambios." }, { status: 409 });

  const presentes = await listDocs(c.carpetaId);
  if (DOCS.some((d) => !presentes.includes(d.key)))
    return NextResponse.json({ error: "Faltan documentos por cargar." }, { status: 400 });

  await updateCandidate(c.id, { estado: ESTADOS.EN_REVISION, motivo: "" });
  const a = mail.recepcion(c.nombre);
  await sendMail(c.email, a.subject, a.html);
  const n = mail.nuevosDocs(c.nombre, c.maestria, `${baseUrl()}/admin/${c.id}`);
  await sendMail(cfg().coordinadoras, n.subject, n.html);
  return NextResponse.json({ ok: true });
}
