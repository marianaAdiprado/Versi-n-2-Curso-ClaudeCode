"use client";
import { useState } from "react";

type Doc = { key: string; label: string };

export default function UploadForm({ token, docs, presentes }: { token: string; docs: Doc[]; presentes: string[] }) {
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const listo = docs.every((d) => files[d.key] || presentes.includes(d.key));

  function pick(key: string, f?: File) {
    setError("");
    if (f && f.size > 4 * 1024 * 1024) return setError(`"${f.name}" pesa más de 4 MB. Comprímelo e inténtalo de nuevo.`);
    setFiles((p) => ({ ...p, [key]: f }));
  }

  async function enviar() {
    setBusy(true);
    setError("");
    try {
      for (const d of docs) {
        const f = files[d.key];
        if (!f) continue;
        const fd = new FormData();
        fd.set("tipo", d.key);
        fd.set("file", f);
        const r = await fetch(`/api/documentos/${token}`, { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || `No se pudo cargar "${d.label}".`);
      }
      const r = await fetch(`/api/documentos/${token}/finalizar`, { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "No se pudo finalizar el envío.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="msg ok">
        <strong>¡Documentos enviados!</strong> La Coordinación Académica los revisará en un máximo de 3 días hábiles y te escribiremos por correo.
      </div>
    );

  return (
    <div className="card">
      {docs.map((d) => {
        const f = files[d.key];
        const ya = presentes.includes(d.key);
        return (
          <div className="doc" key={d.key}>
            <div>
              <strong>{d.label}</strong>
              <div className="hint">{f ? f.name : ya ? "Ya cargado (puedes reemplazarlo)" : "PDF, JPG o PNG · máx. 4 MB"}</div>
            </div>
            <div>
              <span className={`tag ${f || ya ? "ok" : "warn"}`}>{f ? "Listo para enviar" : ya ? "Cargado" : "Pendiente"}</span>{" "}
              <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => pick(d.key, e.target.files?.[0])} />
            </div>
          </div>
        );
      })}
      {error && <div className="msg err">{error}</div>}
      <p><button className="btn" disabled={!listo || busy} onClick={enviar}>{busy ? "Enviando…" : "Enviar documentos"}</button></p>
      {!listo && <p className="hint">El envío se habilita cuando los cuatro documentos estén cargados.</p>}
    </div>
  );
}
