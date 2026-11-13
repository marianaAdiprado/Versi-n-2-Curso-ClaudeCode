import { calendar } from "./google";
import { TZ } from "./config";
import type { Candidate } from "./types";

// México no usa horario de verano desde 2022: UTC-6 fijo en CDMX.
const OFFSET = "-06:00";
const START_MIN = 9 * 60;
const END_MIN = 16 * 60;
const DAYS_AHEAD = 14;
const MIN_LEAD_HOURS = 24;

export const slotMinutes = () => Number(process.env.SLOT_MINUTES || 45);
const calId = () => process.env.CALENDAR_ID || "primary";

const ymdMx = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

export function candidateSlots(): Date[] {
  const out: Date[] = [];
  const now = Date.now();
  const dur = slotMinutes();
  for (let i = 0; i <= DAYS_AHEAD; i++) {
    const ymd = ymdMx(new Date(now + i * 86400000));
    const wd = new Date(`${ymd}T12:00:00${OFFSET}`).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    for (let m = START_MIN; m + dur <= END_MIN; m += dur) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const d = new Date(`${ymd}T${hh}:${mm}:00${OFFSET}`);
      if (d.getTime() >= now + MIN_LEAD_HOURS * 3600000) out.push(d);
    }
  }
  return out;
}

async function busyRanges(min: Date, max: Date) {
  const r = await calendar().freebusy.query({
    requestBody: { timeMin: min.toISOString(), timeMax: max.toISOString(), timeZone: TZ, items: [{ id: calId() }] },
  });
  const cal = Object.values(r.data.calendars ?? {})[0];
  return (cal?.busy ?? []).map((b) => ({ s: new Date(b.start!).getTime(), e: new Date(b.end!).getTime() }));
}

export async function availableSlots(): Promise<string[]> {
  const all = candidateSlots();
  if (!all.length) return [];
  const dur = slotMinutes() * 60000;
  const busy = await busyRanges(all[0], new Date(all[all.length - 1].getTime() + dur));
  return all
    .filter((d) => !busy.some((b) => d.getTime() < b.e && d.getTime() + dur > b.s))
    .map((d) => d.toISOString());
}

export async function bookSlot(c: Candidate, iso: string) {
  const free = await availableSlots(); // vuelve a consultar: evita dobles reservas
  if (!free.includes(iso)) return null;
  const start = new Date(iso);
  const end = new Date(start.getTime() + slotMinutes() * 60000);
  const attendees = [{ email: c.email }];
  if (process.env.ENTREVISTADOR_EMAIL) attendees.push({ email: process.env.ENTREVISTADOR_EMAIL });
  const ev = await calendar().events.insert({
    calendarId: calId(),
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: `Entrevista docente · ${c.maestria} · ${c.nombre}`,
      description: `Candidato: ${c.nombre} (${c.email})\nMaestría: ${c.maestria}`,
      start: { dateTime: start.toISOString(), timeZone: TZ },
      end: { dateTime: end.toISOString(), timeZone: TZ },
      attendees,
      conferenceData: {
        createRequest: { requestId: `${c.id}-${Date.now()}`, conferenceSolutionKey: { type: "hangoutsMeet" } },
      },
    },
  });
  const meet =
    ev.data.hangoutLink ?? ev.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ?? "";
  return { eventId: ev.data.id ?? "", meetUrl: meet };
}
