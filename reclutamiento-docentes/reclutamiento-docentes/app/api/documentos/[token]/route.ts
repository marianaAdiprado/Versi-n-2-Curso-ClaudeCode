import { NextResponse } from "next/server";
import { candidateFromToken } from "@/lib/candidate";
import { uploadDoc } from "@/lib/drive";
import { DOCS, ESTADOS } from "@/lib/types";

export const maxDuration = 30;
const MAX_BYTES = 4 * 1024 * 1024; // límite de cuerpo de las funciones de Vercel: ~4.5 MB

const TYPES: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const c = await candidateFromToken(token);
  if (!c) return NextResponse.json({ error: "Enlace inválido o vencido." }, { status: 401 });
  if (c.estado !== ESTADOS.PENDIENTE_DOCS && c.estado !== ESTADOS.CORRECCION)
    return NextResponse.json({ error: "Tu expediente ya no admite cambios." }, { status: 409 });
  if (!c.carpetaId) return NextResponse.json({ error: "Expediente sin carpeta." }, { status: 500 });

  const form = await req.formData();
  const doc = DOCS.find((d) => d.key === form.get("tipo"));
  const file = form.get("file");
  if (!doc || !(file instanceof File)) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Formato no permitido. Usa PDF, JPG o PNG." }, { status: 400 });
  if (file.size === 0 || file.size > MAX_BYTES)
    return NextResponse.json({ error: "El archivo debe pesar máximo 4 MB." }, { status: 400 });

  await uploadDoc(c.carpetaId, doc.prefix, ext, file.type, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ ok: true });
}
