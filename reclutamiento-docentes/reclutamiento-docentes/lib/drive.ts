import { Readable } from "node:stream";
import { drive } from "./google";
import { DOCS } from "./types";

const FOLDER = "application/vnd.google-apps.folder";
const q = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

async function ensureFolder(name: string, parentId: string) {
  const api = drive();
  const found = await api.files.list({
    q: `name='${q(name)}' and '${parentId}' in parents and mimeType='${FOLDER}' and trashed=false`,
    fields: "files(id)",
    pageSize: 1,
  });
  if (found.data.files?.[0]?.id) return found.data.files[0].id;
  const created = await api.files.create({
    requestBody: { name, mimeType: FOLDER, parents: [parentId] },
    fields: "id",
  });
  return created.data.id!;
}

/** Carpeta del expediente: <raíz>/<convocatoria>/<maestría>/<nombre> (<id>) */
export async function createCandidateFolder(convocatoria: string, maestria: string, nombre: string, id: string) {
  const root = process.env.DRIVE_ROOT_FOLDER_ID;
  if (!root) throw new Error("Falta DRIVE_ROOT_FOLDER_ID");
  const conv = await ensureFolder(convocatoria, root);
  const mae = await ensureFolder(maestria, conv);
  const safe = nombre.replace(/[\\/:*?"<>|]/g, " ").trim();
  const created = await drive().files.create({
    requestBody: { name: `${safe} (${id})`, mimeType: FOLDER, parents: [mae] },
    fields: "id, webViewLink",
  });
  return { id: created.data.id!, url: created.data.webViewLink! };
}

export async function listDocs(folderId: string) {
  const r = await drive().files.list({
    q: `'${folderId}' in parents and trashed=false and mimeType!='${FOLDER}'`,
    fields: "files(id,name)",
    pageSize: 50,
  });
  const names = (r.data.files ?? []).map((f) => f.name ?? "");
  return DOCS.filter((d) => names.some((n) => n.startsWith(d.prefix))).map((d) => d.key as string);
}

export async function uploadDoc(folderId: string, prefix: string, ext: string, mimeType: string, data: Buffer) {
  const api = drive();
  // Reemplaza versiones anteriores del mismo documento (correcciones).
  const old = await api.files.list({
    q: `'${folderId}' in parents and trashed=false and name contains '${q(prefix)}'`,
    fields: "files(id)",
  });
  for (const f of old.data.files ?? []) if (f.id) await api.files.delete({ fileId: f.id });
  await api.files.create({
    requestBody: { name: `${prefix}.${ext}`, parents: [folderId] },
    media: { mimeType, body: Readable.from(data) },
    fields: "id",
  });
}
