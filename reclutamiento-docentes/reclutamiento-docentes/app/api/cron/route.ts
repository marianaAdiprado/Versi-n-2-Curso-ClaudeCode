import { NextResponse } from "next/server";
import { baseUrl, businessDaysSince, cfg, fmtDate } from "@/lib/config";
import { listCandidates, updateCandidate } from "@/lib/sheet";
import { signCandidateToken } from "@/lib/session";
import { sendMail } from "@/lib/mail";
import { mail } from "@/lib/emails";
import { ESTADOS } from "@/lib/types";

export const maxDuration = 60;

const days = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400000;
const hasTag = (r: string, t: string) => r.split(",").includes(t);
const addTag = (r: string, t: string) => (r ? `${r},${t}` : t);

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return new NextResponse("No autorizado", { status: 401 });

  const all = await listCandidates();
  const sinRevisar: string[] = [];
  const cerrados: string[] = [];
  const retencion: string[] = [];

  for (const c of all) {
    // 1) Revisión de documentos > 3 días hábiles
    if (c.estado === ESTADOS.EN_REVISION && businessDaysSince(c.estadoDesde) >= 3 && !hasTag(c.recordatorios, "rev3")) {
      sinRevisar.push(`${c.nombre} (${c.maestria}) · desde ${fmtDate(c.estadoDesde)}`);
      await updateCandidate(c.id, { recordatorios: addTag(c.recordatorios, "rev3") });
    }
    // 2) Validado sin agendar: recordatorio a los 3 días, cierre a los 7
    if (c.estado === ESTADOS.VALIDADO) {
      if (days(c.estadoDesde) >= 7) {
        await updateCandidate(c.id, { estado: ESTADOS.CERRADO, motivo: "No agendó entrevista en 7 días" });
        cerrados.push(`${c.nombre} (${c.maestria}) · no agendó entrevista`);
      } else if (days(c.estadoDesde) >= 3 && !hasTag(c.recordatorios, "ag3")) {
        const link = `${baseUrl()}/agenda/${await signCandidateToken(c.id)}`;
        const m = mail.recordatorioAgenda(c.nombre, link);
        await sendMail(c.email, m.subject, m.html);
        await updateCandidate(c.id, { recordatorios: addTag(c.recordatorios, "ag3") });
      }
    }
    // 3) Corrección sin respuesta > 5 días hábiles
    if (c.estado === ESTADOS.CORRECCION && businessDaysSince(c.estadoDesde) >= 5) {
      await updateCandidate(c.id, { estado: ESTADOS.CERRADO, motivo: "No corrigió documentos en 5 días hábiles" });
      cerrados.push(`${c.nombre} (${c.maestria}) · no corrigió documentos`);
    }
    // 4) Retención de expedientes: 2 años desde el registro
    if (days(c.creado) >= 730 && !hasTag(c.recordatorios, "ret")) {
      retencion.push(`${c.nombre} · registrado ${fmtDate(c.creado)} · carpeta: ${c.carpetaUrl || "sin carpeta"}`);
      await updateCandidate(c.id, { recordatorios: addTag(c.recordatorios, "ret") });
    }
  }

  const secciones = [
    { titulo: "Documentos con más de 3 días hábiles sin revisar", items: sinRevisar },
    { titulo: "Expedientes cerrados por falta de respuesta", items: cerrados },
    { titulo: "Expedientes que cumplieron 2 años (eliminar datos y carpeta de Drive)", items: retencion },
  ].filter((s) => s.items.length);
  if (secciones.length) {
    const m = mail.resumen(secciones);
    await sendMail(cfg().coordinadoras, m.subject, m.html);
  }
  return NextResponse.json({ ok: true, avisos: secciones.length });
}
