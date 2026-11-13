"use client";
import { useState } from "react";

type Day = { label: string; slots: { iso: string; hora: string }[] };

export default function AgendaPicker({ token, days }: { token: string; days: Day[] }) {
  const [sel, setSel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirmar() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/agenda/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slot: sel }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "No se pudo agendar.");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="days">
        {days.map((d) => (
          <div className="card" key={d.label} style={{ margin: 0 }}>
            <strong style={{ textTransform: "capitalize" }}>{d.label}</strong>
            <div className="slots">
              {d.slots.map((s) => (
                <button key={s.iso} type="button" className={`slot ${sel === s.iso ? "sel" : ""}`} onClick={() => setSel(s.iso)}>
                  {s.hora}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <div className="msg err">{error}</div>}
      <p><button className="btn" disabled={!sel || busy} onClick={confirmar}>{busy ? "Agendando…" : "Confirmar entrevista"}</button></p>
    </div>
  );
}
