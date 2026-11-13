import { candidateFromToken } from "@/lib/candidate";
import { listDocs } from "@/lib/drive";
import { DOCS, ESTADOS } from "@/lib/types";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default async function Subir({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = await candidateFromToken(token);
  if (!c)
    return (
      <main>
        <h1>Enlace inválido o vencido</h1>
        <p>Revisa el correo más reciente que te enviamos o escribe a la Coordinación Académica.</p>
      </main>
    );

  const editable = c.estado === ESTADOS.PENDIENTE_DOCS || c.estado === ESTADOS.CORRECCION;
  if (!editable)
    return (
      <main>
        <h1>Hola, {c.nombre.split(" ")[0]}</h1>
        {c.estado === ESTADOS.EN_REVISION ? (
          <div className="msg ok">Ya recibimos tus documentos. La Coordinación Académica los revisará en un máximo de 3 días hábiles y te escribiremos por correo.</div>
        ) : c.estado === ESTADOS.CERRADO ? (
          <div className="msg info">Este proceso se cerró por falta de respuesta. Si crees que es un error, escribe a la Coordinación Académica.</div>
        ) : (
          <div className="msg info">Tu documentación ya fue procesada. Estatus actual: <strong>{c.estado}</strong>.</div>
        )}
      </main>
    );

  const presentes = await listDocs(c.carpetaId);
  return (
    <main>
      <h1>Carga tus documentos</h1>
      <p className="lead">Hola, {c.nombre.split(" ")[0]}. Necesitamos estos cuatro documentos para validar tu perfil.</p>
      {c.estado === ESTADOS.CORRECCION && (
        <div className="msg err"><strong>Corrección solicitada:</strong> {c.motivo}</div>
      )}
      <UploadForm token={token} docs={DOCS.map((d) => ({ key: d.key, label: d.label }))} presentes={presentes} />
    </main>
  );
}
