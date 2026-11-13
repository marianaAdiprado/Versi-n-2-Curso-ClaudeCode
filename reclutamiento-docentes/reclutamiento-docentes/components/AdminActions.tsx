"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const E = {
  EN_REVISION: "En revisión de documentos",
  AGENDADA: "Entrevista agendada",
  ENTREVISTADO: "Entrevistado, pendiente de confirmación",
};
const RESULTADOS = ["Seleccionado", "En banco de reserva", "Rechazado"];

export default function AdminActions({ id, estado, propuesto, roles }: { id: string; estado: string; propuesto: string; roles: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [motivo, setMotivo] = useState("");
  const [prop, setProp] = useState("");
  const [notas, setNotas] = useState("");
  const [final, setFinal] = useState(propuesto || "");
  const coord = roles.includes("coordinadora");
  const dir = roles.includes("director");

  async function run(accion: string, extra: Record<string, string> = {}, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/${accion}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...extra }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "No se pudo completar la acción.");
      setMotivo("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setBusy(false);
    }
  }

  let body: React.ReactNode = null;

  if (estado === E.EN_REVISION && coord) {
    body = (
      <>
        <h2 style={{ marginTop: 0 }}>Revisión de documentos</h2>
        <p className="hint">Revisa los documentos en Drive (validación visual) y decide.</p>
        <p><button className="btn" disabled={busy} onClick={() => run("validar", {}, "¿Validar y enviar al candidato el enlace para agendar entrevista?")}>Validar y enviar agenda</button></p>
        <label htmlFor="motivo">Motivo (se envía al candidato si pides corrección; es interno si marcas “No cumple”)</label>
        <textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: La cédula está ilegible; vuelve a cargar una imagen más nítida." />
        <p style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn sec" disabled={busy} onClick={() => run("correccion", { motivo })}>Pedir corrección</button>
          <button className="btn danger" disabled={busy} onClick={() => run("no-cumple", { motivo }, "Se notificará al candidato que no cumple el perfil. ¿Continuar?")}>Marcar como no cumple</button>
        </p>
      </>
    );
  } else if (estado === E.AGENDADA && coord) {
    body = (
      <>
        <h2 style={{ marginTop: 0 }}>Resultado de la entrevista</h2>
        <label htmlFor="prop">Estado propuesto</label>
        <select id="prop" value={prop} onChange={(e) => setProp(e.target.value)}>
          <option value="">Selecciona…</option>
          {RESULTADOS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <label htmlFor="notas">Notas (experiencia en el área temática y en docencia en línea)</label>
        <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
        <p><button className="btn" disabled={busy || !prop} onClick={() => run("entrevista", { estadoPropuesto: prop, notas })}>Enviar a confirmación de direcciones</button></p>
      </>
    );
  } else if (estado === E.ENTREVISTADO && dir) {
    body = (
      <>
        <h2 style={{ marginTop: 0 }}>Confirmación final</h2>
        <label htmlFor="final">Estado final</label>
        <select id="final" value={final} onChange={(e) => setFinal(e.target.value)}>
          <option value="">Selecciona…</option>
          {RESULTADOS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <p><button className="btn" disabled={busy || !final} onClick={() => run("confirmar", { estadoFinal: final }, `¿Confirmar “${final}”? ${final === "Seleccionado" ? "Se avisará a la coordinadora para enviar el contrato." : "Se enviará un mensaje al candidato."}`)}>Confirmar estado final</button></p>
      </>
    );
  } else {
    body = <p className="hint">No hay acciones disponibles para tu rol en este estado.</p>;
  }

  return (
    <div className="card">
      {body}
      {error && <div className="msg err">{error}</div>}
    </div>
  );
}
