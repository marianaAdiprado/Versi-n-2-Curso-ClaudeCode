import { redirect } from "next/navigation";
import { cfg, fmtDate } from "@/lib/config";
import { getSession } from "@/lib/session";
import { listCandidates } from "@/lib/sheet";
import { ESTADOS } from "@/lib/types";
import { tagClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Admin({ searchParams }: { searchParams: Promise<{ maestria?: string; estado?: string }> }) {
  const s = await getSession();
  if (!s) redirect("/login");
  const { maestria = "", estado = "" } = await searchParams;
  const c = cfg();
  const all = await listCandidates();
  const rows = all
    .filter((x) => x.convocatoria === c.convocatoriaId)
    .filter((x) => (!maestria || x.maestria === maestria) && (!estado || x.estado === estado))
    .sort((a, b) => b.creado.localeCompare(a.creado));

  const pendientesRevision = all.filter((x) => x.estado === ESTADOS.EN_REVISION).length;
  const pendientesConfirmar = all.filter((x) => x.estado === ESTADOS.ENTREVISTADO).length;

  return (
    <main className="wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1>Panel · {c.convocatoriaNombre}</h1>
        <form action="/api/auth/logout" method="post">
          <span className="hint">{s.email} · {s.roles.join(", ")} </span>
          <button className="btn ghost small">Salir</button>
        </form>
      </div>

      <div className="grid">
        <div className="kpi"><span className="hint">Por revisar documentos</span><br /><b>{pendientesRevision}</b></div>
        <div className="kpi"><span className="hint">Pendientes de confirmación (direcciones)</span><br /><b>{pendientesConfirmar}</b></div>
        {c.maestrias.map((m) => {
          const sel = all.filter((x) => x.convocatoria === c.convocatoriaId && x.maestria === m && x.estado === ESTADOS.SELECCIONADO).length;
          const tot = all.filter((x) => x.convocatoria === c.convocatoriaId && x.maestria === m).length;
          return (
            <div className="kpi" key={m}>
              <span className="hint">{m}</span><br />
              <b>{sel}/{c.meta}</b> <span className="hint">seleccionados · {tot} postulantes</span>
              <div className="bar"><i style={{ width: `${Math.min(100, (sel / c.meta) * 100)}%` }} /></div>
            </div>
          );
        })}
      </div>

      <form className="filters" method="get">
        <div>
          <label htmlFor="m">Maestría</label>
          <select id="m" name="maestria" defaultValue={maestria}>
            <option value="">Todas</option>
            {c.maestrias.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="e">Estado</label>
          <select id="e" name="estado" defaultValue={estado}>
            <option value="">Todos</option>
            {Object.values(ESTADOS).map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
        <button className="btn sec small">Filtrar</button>
      </form>

      <div className="scroll">
        <table>
          <thead><tr><th>Candidato</th><th>Maestría</th><th>Estado</th><th>Registro</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.nombre}</strong><br /><span className="hint">{r.email}</span></td>
                <td>{r.maestria}</td>
                <td><span className={`tag ${tagClass(r.estado)}`}>{r.estado}</span></td>
                <td>{fmtDate(r.creado)}</td>
                <td><a href={`/admin/${r.id}`}>Abrir</a></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="hint">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
