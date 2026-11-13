import { randomBytes } from "node:crypto";
import { sheets } from "./google";
import { COLUMNS, Candidate } from "./types";

const TAB = "Candidatos";
let ready = false;

function col(n: number) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
const LAST = col(COLUMNS.length);
const sid = () => {
  const id = process.env.SHEET_ID;
  if (!id) throw new Error("Falta SHEET_ID");
  return id;
};

async function ensureTab() {
  if (ready) return;
  const api = sheets();
  const meta = await api.spreadsheets.get({ spreadsheetId: sid(), fields: "sheets.properties.title" });
  if (!meta.data.sheets?.some((s) => s.properties?.title === TAB)) {
    await api.spreadsheets.batchUpdate({
      spreadsheetId: sid(),
      requestBody: { requests: [{ addSheet: { properties: { title: TAB, gridProperties: { frozenRowCount: 1 } } } }] },
    });
  }
  const head = await api.spreadsheets.values.get({ spreadsheetId: sid(), range: `${TAB}!A1:${LAST}1` });
  if (!head.data.values?.length) {
    await api.spreadsheets.values.update({
      spreadsheetId: sid(),
      range: `${TAB}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...COLUMNS]] },
    });
  }
  ready = true;
}

function toCandidate(row: string[]): Candidate {
  const c = {} as Candidate;
  COLUMNS.forEach((k, i) => (c[k] = row[i] ?? ""));
  return c;
}
const toRow = (c: Candidate) => COLUMNS.map((k) => c[k] ?? "");

export async function listCandidates(): Promise<Candidate[]> {
  await ensureTab();
  const r = await sheets().spreadsheets.values.get({ spreadsheetId: sid(), range: `${TAB}!A2:${LAST}` });
  return (r.data.values ?? []).map(toCandidate).filter((c) => c.id);
}

export async function getCandidate(id: string) {
  return (await listCandidates()).find((c) => c.id === id) ?? null;
}

export async function addCandidate(data: Partial<Candidate>): Promise<Candidate> {
  await ensureTab();
  const now = new Date().toISOString();
  const c = toCandidate([]);
  Object.assign(c, data, {
    id: randomBytes(6).toString("hex"),
    creado: now,
    estadoDesde: now,
    actualizado: now,
  });
  await sheets().spreadsheets.values.append({
    spreadsheetId: sid(),
    range: `${TAB}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [toRow(c)] },
  });
  return c;
}

export async function updateCandidate(id: string, patch: Partial<Candidate>): Promise<Candidate> {
  await ensureTab();
  const r = await sheets().spreadsheets.values.get({ spreadsheetId: sid(), range: `${TAB}!A2:${LAST}` });
  const rows = r.data.values ?? [];
  const idx = rows.findIndex((row) => row[0] === id);
  if (idx < 0) throw new Error("Candidato no encontrado");
  const now = new Date().toISOString();
  const cur = toCandidate(rows[idx]);
  const next: Candidate = { ...cur, ...patch, actualizado: now };
  if (patch.estado && patch.estado !== cur.estado) next.estadoDesde = now;
  const rowNum = idx + 2;
  await sheets().spreadsheets.values.update({
    spreadsheetId: sid(),
    range: `${TAB}!A${rowNum}:${LAST}${rowNum}`,
    valueInputOption: "RAW",
    requestBody: { values: [toRow(next)] },
  });
  return next;
}
