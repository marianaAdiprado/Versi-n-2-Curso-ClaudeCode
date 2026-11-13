"use client";
import { useState } from "react";

type YN = "" | "si" | "no";

function YesNo({ name, value, onChange }: { name: string; value: YN; onChange: (v: YN) => void }) {
  return (
    <div className="radios">
      {(["si", "no"] as const).map((v) => (
        <label key={v}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} required />
          {v === "si" ? "Sí" : "No"}
        </label>
      ))}
    </div>
  );
}

export default function RegistroForm({ maestrias, regimenes, aviso }: { maestrias: string[]; regimenes: string[]; aviso: string[] }) {
  const [f, setF] = useState({
    nombre: "", email: "", telefono: "", maestria: "", regimen: "",
    tituloMaestria: "" as YN, expVirtual: "" as YN, resideCdmx: "" as YN, doctorado: "" as YN,
    privacidad: false, web: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [descartado, setDescartado] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/registro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "No pudimos enviar tu registro.");
      if (d.cumple) window.location.href = d.next;
      else setDescartado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setBusy(false);
    }
  }

  if (descartado)
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Gracias por tu interés</h2>
        <p>Por el momento tu perfil no cumple los requisitos de esta convocatoria. Conservaremos tus datos para considerarte en futuras convocatorias y te enviamos un correo con esta información.</p>
        <a href="/">Volver al inicio</a>
      </div>
    );

  return (
    <form onSubmit={submit} className="card">
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.web} onChange={(e) => set("web", e.target.value)} name="web" />

      <label htmlFor="nombre">Nombre completo</label>
      <input id="nombre" type="text" required minLength={3} maxLength={120} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} />

      <label htmlFor="email">Correo electrónico</label>
      <input id="email" type="email" required value={f.email} onChange={(e) => set("email", e.target.value)} />

      <label htmlFor="tel">Teléfono</label>
      <input id="tel" type="tel" required value={f.telefono} onChange={(e) => set("telefono", e.target.value)} />

      <label htmlFor="mae">Maestría a la que te postulas <span className="hint">(solo una)</span></label>
      <select id="mae" required value={f.maestria} onChange={(e) => set("maestria", e.target.value)}>
        <option value="">Selecciona…</option>
        {maestrias.map((m) => <option key={m}>{m}</option>)}
      </select>

      <label>¿Cuentas con título y cédula profesional de maestría?</label>
      <YesNo name="titulo" value={f.tituloMaestria} onChange={(v) => set("tituloMaestria", v)} />

      <label>¿Tienes experiencia docente en ambientes virtuales?</label>
      <YesNo name="virtual" value={f.expVirtual} onChange={(v) => set("expVirtual", v)} />

      <label>¿Resides en la Ciudad de México?</label>
      <YesNo name="cdmx" value={f.resideCdmx} onChange={(v) => set("resideCdmx", v)} />

      <label htmlFor="reg">Régimen fiscal en tu constancia de situación fiscal</label>
      <select id="reg" required value={f.regimen} onChange={(e) => set("regimen", e.target.value)}>
        <option value="">Selecciona…</option>
        {regimenes.map((r) => <option key={r}>{r}</option>)}
      </select>

      <label>¿Cuentas con grado de doctorado? <span className="hint">(deseable, no es obligatorio)</span></label>
      <YesNo name="doc" value={f.doctorado} onChange={(v) => set("doctorado", v)} />

      <details>
        <summary>Aviso de privacidad</summary>
        {aviso.map((p, i) => <p key={i} className="hint">{p}</p>)}
      </details>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontWeight: 500 }}>
        <input type="checkbox" required checked={f.privacidad} onChange={(e) => set("privacidad", e.target.checked)} style={{ marginTop: 5 }} />
        He leído y acepto el aviso de privacidad y la protección de mis datos y documentos.
      </label>

      {error && <div className="msg err">{error}</div>}
      <p><button className="btn" disabled={busy}>{busy ? "Enviando…" : "Enviar registro"}</button></p>
    </form>
  );
}
