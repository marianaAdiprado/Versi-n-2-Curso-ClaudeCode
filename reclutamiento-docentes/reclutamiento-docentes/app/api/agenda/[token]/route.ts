import { NextResponse } from "next/server";
import { candidateFromToken } from "@/lib/candidate";
import { bookSlot } from "@/lib/slots";
import { updateCandidate } from "@/lib/sheet";
import { sendMail } from "@/lib/mail";
import { mail } from "@/lib/emails";
import { ESTADOS } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const c = await candidateFromToken(token);
  if (!c) return NextResponse.json({ error: "Enlace inválido o vencido." }, { status: 401 });
  if (c.estado !== ESTADOS.VALIDADO)
    return NextResponse.json({ error: "Ya tienes una entrevista o tu expediente no está listo para agendar." }, { status: 409 });

  const { slot } = (await req.json().catch(() => ({}))) as { slot?: string };
  if (!slot || Number.isNaN(Date.parse(slot))) return NextResponse.json({ error: "Horario inválido." }, { status: 400 });
  const iso = new Date(slot).toISOString();

  const booked = await bookSlot(c, iso);
  if (!booked) return NextResponse.json({ error: "Ese horario ya no está disponible. Elige otro." }, { status: 409 });

  await updateCandidate(c.id, {
    estado: ESTADOS.AGENDADA,
    entrevista: iso,
    meetUrl: booked.meetUrl,
    eventoId: booked.eventId,
  });
  const m = mail.entrevista(c.nombre, iso, booked.meetUrl);
  await sendMail(c.email, m.subject, m.html);
  return NextResponse.json({ ok: true });
}
