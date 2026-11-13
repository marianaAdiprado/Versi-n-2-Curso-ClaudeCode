import { notFound, redirect } from "next/navigation";
import { fmtDate, fmtDateTime } from "@/lib/config";
import { getSession } from "@/lib/session";
import { getCandidate } from "@/lib/sheet";
import { tagClass } from "@/lib/ui";
import AdminActions from "@/components/AdminActions";

export const dynamic = "force-dynamic";

export default async function Detalle({ params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) redirect("/login");
  const { id } = await params;
  const c = await getCandidate(id);
  if (!c) notFound();

  return (
    <main>
      <p><a href="/admin">← Volver al panel</a></p>
      <h1>{c.nombre}</h1>
      <p><span className={`tag ${tagClass(c.estado)}`}>{c.estado}</span></p>

      <div className="card">
        <dl>
          <dt>Maestría</dt><dd>{c.maestria}</dd>
          <dt>Correo</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd>
          <dt>Teléfono</dt><dd>{c.telefono}</dd>
          <dt>Régimen fiscal declarado</dt><dd>{c.regimen}</dd>
          <dt>Doctorado (deseable)</dt><dd>{c.doctorado}</dd>
          <dt>Registro</dt><dd>{fmtDate(c.creado)}</dd>
          <dt>Documentos</dt><dd>{c.carpetaUrl ? <a href={c.carpetaUrl} target="_blank" rel="noreferrer">Abrir carpeta en Drive</a> : "—"}</dd>
          {c.motivo && (<><dt>Motivo / observación</dt><dd>{c.motivo}</dd></>)}
          {c.entrevista && (<><dt>Entrevista</dt><dd>{fmtDateTime(c.entrevista)} {c.meetUrl && <>· <a href={c.meetUrl} target="_blank" rel="noreferrer">Meet</a></>}</dd></>)}
          {c.estadoPropuesto && (<><dt>Estado propuesto</dt><dd>{c.estadoPropuesto}</dd></>)}
          {c.notas && (<><dt>Notas de entrevista</dt><dd style={{ whiteSpace: "pre-wrap" }}>{c.notas}</dd></>)}
          {c.confirmadoPor && (<><dt>Confirmado por</dt><dd>{c.confirmadoPor}</dd></>)}
        </dl>
      </div>

      <AdminActions id={c.id} estado={c.estado} propuesto={c.estadoPropuesto} roles={s.roles} />
    </main>
  );
}
