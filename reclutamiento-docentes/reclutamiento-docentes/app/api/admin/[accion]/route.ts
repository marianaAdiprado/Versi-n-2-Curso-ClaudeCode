import { NextResponse } from "next/server";
import { baseUrl, cfg } from "@/lib/config";
import { getSession } from "@/lib/session";
import { signCandidateToken } from "@/lib/session";
import { getCandidate, updateCandidate } from "@/lib/sheet";
import { sendMail } from "@/lib/mail";
import { mail } from "@/lib/emails";
import { ESTADOS, RESULTADOS } from "@/lib/types";

export const maxDuration = 30;

const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params;
  const s = await getSession();
  if (!s) return err("No autenticado.", 401);

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const c = await getCandidate(String(body.id ?? ""));
  if (!c) return err("Candidato no encontrado.", 404);

  const isCoord = s.roles.includes("coordinadora");
  const isDir = s.roles.includes("director");
  const motivo = String(body.motivo ?? "").trim().slice(0, 600);

  switch (accion) {
    case "validar": {
      if (!isCoord) return err("Sin permiso.", 403);
      if (c.estado !== ESTADOS.EN_REVISION) return err("El expediente no está en revisión.", 409);
      await updateCandidate(c.id, { estado: ESTADOS.VALIDADO, motivo: "" });
      const link = `${baseUrl()}/agenda/${await signCandidateToken(c.id)}`;
      const m = mail.validado(c.nombre, link);
      await sendMail(c.email, m.subject, m.html);
      return NextResponse.json({ ok: true });
    }
    case "correccion": {
      if (!isCoord) return err("Sin permiso.", 403);
      if (c.estado !== ESTADOS.EN_REVISION) return err("El expediente no está en revisión.", 409);
      if (motivo.length < 5) return err("Indica qué documento debe corregirse y por qué.");
      await updateCandidate(c.id, { estado: ESTADOS.CORRECCION, motivo });
      const link = `${baseUrl()}/subir/${await signCandidateToken(c.id)}`;
      const m = mail.correccion(c.nombre, motivo, link);
      await sendMail(c.email, m.subject, m.html);
      return NextResponse.json({ ok: true });
    }
    case "no-cumple": {
      if (!isCoord) return err("Sin permiso.", 403);
      if (c.estado !== ESTADOS.EN_REVISION) return err("El expediente no está en revisión.", 409);
      if (motivo.length < 5) return err("Registra el motivo (interno).");
      await updateCandidate(c.id, { estado: ESTADOS.NO_CUMPLE, motivo });
      const m = mail.descarte(c.nombre);
      await sendMail(c.email, m.subject, m.html);
      return NextResponse.json({ ok: true });
    }
    case "entrevista": {
      if (!isCoord) return err("Sin permiso.", 403);
      if (c.estado !== ESTADOS.AGENDADA) return err("El candidato no tiene entrevista agendada.", 409);
      const propuesto = String(body.estadoPropuesto ?? "");
      if (!(RESULTADOS as readonly string[]).includes(propuesto)) return err("Estado inválido.");
      await updateCandidate(c.id, {
        estado: ESTADOS.ENTREVISTADO,
        estadoPropuesto: propuesto,
        notas: String(body.notas ?? "").slice(0, 2000),
      });
      return NextResponse.json({ ok: true });
    }
    case "confirmar": {
      if (!isDir) return err("Solo los directores confirman el estado final.", 403);
      if (c.estado !== ESTADOS.ENTREVISTADO) return err("El candidato no está pendiente de confirmación.", 409);
      const final = String(body.estadoFinal ?? "");
      if (!(RESULTADOS as readonly string[]).includes(final)) return err("Estado inválido.");
      await updateCandidate(c.id, { estado: final as (typeof RESULTADOS)[number], confirmadoPor: s.email });
      if (final === ESTADOS.SELECCIONADO) {
        const m = mail.seleccionado(c.nombre, c.maestria, `${baseUrl()}/admin/${c.id}`);
        await sendMail(cfg().coordinadoras, m.subject, m.html);
      } else {
        const m = final === ESTADOS.BANCO ? mail.banco(c.nombre) : mail.rechazo(c.nombre);
        await sendMail(c.email, m.subject, m.html);
      }
      return NextResponse.json({ ok: true });
    }
    default:
      return err("Acción desconocida.", 404);
  }
}
