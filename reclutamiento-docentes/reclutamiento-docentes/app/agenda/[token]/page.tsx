import { candidateFromToken } from "@/lib/candidate";
import { TZ, fmtDateTime } from "@/lib/config";
import { availableSlots } from "@/lib/slots";
import { ESTADOS } from "@/lib/types";
import AgendaPicker from "@/components/AgendaPicker";

export const dynamic = "force-dynamic";

export default async function Agenda({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = await candidateFromToken(token);
  if (!c)
    return (
      <main>
        <h1>Enlace inválido o vencido</h1>
        <p>Revisa el correo más reciente que te enviamos o escribe a la Coordinación Académica.</p>
      </main>
    );

  if (c.estado === ESTADOS.AGENDADA)
    return (
      <main>
        <h1>Tu entrevista está agendada</h1>
        <div className="card">
          <p><strong>{fmtDateTime(c.entrevista)}</strong> (hora de Ciudad de México)</p>
          {c.meetUrl && <p><a className="btn" href={c.meetUrl}>Entrar a Google Meet</a></p>}
          <p className="hint">Para reagendar, escribe a la Coordinación Académica.</p>
        </div>
      </main>
    );

  if (c.estado !== ESTADOS.VALIDADO)
    return (
      <main>
        <h1>Hola, {c.nombre.split(" ")[0]}</h1>
        <div className="msg info">
          {c.estado === ESTADOS.CERRADO
            ? "Este proceso se cerró por falta de respuesta. Si crees que es un error, escribe a la Coordinación Académica."
            : "Aún no puedes agendar tu entrevista. Te avisaremos por correo en cuanto validemos tu documentación."}
        </div>
      </main>
    );

  const slots = await availableSlots();
  const dayFmt = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const hourFmt = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
  const days: { label: string; slots: { iso: string; hora: string }[] }[] = [];
  for (const iso of slots) {
    const d = new Date(iso);
    const label = dayFmt.format(d);
    let g = days.find((x) => x.label === label);
    if (!g) days.push((g = { label, slots: [] }));
    g.slots.push({ iso, hora: hourFmt.format(d) });
  }

  return (
    <main>
      <h1>Agenda tu entrevista</h1>
      <p className="lead">Elige el horario que mejor te acomode. Será por Google Meet, en hora de Ciudad de México.</p>
      {days.length ? (
        <AgendaPicker token={token} days={days} />
      ) : (
        <div className="msg info">No hay horarios disponibles por ahora. Escribe a la Coordinación Académica y con gusto te ayudamos.</div>
      )}
    </main>
  );
}
