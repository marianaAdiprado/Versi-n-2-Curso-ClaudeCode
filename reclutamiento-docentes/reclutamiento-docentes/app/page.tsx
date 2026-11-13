import { cfg, convocatoriaStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function Home() {
  const c = cfg();
  const st = convocatoriaStatus();
  return (
    <main>
      <h1>{c.convocatoriaNombre}</h1>
      <p className="lead">
        Buscamos docentes con experiencia en educación en línea para impartir clases en nuestras maestrías. Queremos
        conocer tu trayectoria y sumar tu experiencia a nuestra comunidad académica.
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Maestrías disponibles</h2>
        <ul>{c.maestrias.map((m) => <li key={m}>{m}</li>)}</ul>
        <p className="hint">Solo puedes postularte a una maestría.</p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Requisitos indispensables</h2>
        <ul>
          <li>Título y cédula profesional con grado de maestría.</li>
          <li>Experiencia docente en ambientes virtuales.</li>
          <li>Residir en la Ciudad de México.</li>
          <li>Constancia de situación fiscal actualizada con régimen de Persona física con actividad empresarial o Régimen Simplificado de Confianza.</li>
        </ul>
        <h2>Deseable</h2>
        <ul><li>Grado de doctorado.</li></ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>¿Cómo es el proceso?</h2>
        <ol className="steps">
          <li>Te registras y confirmas que cumples los requisitos.</li>
          <li>Cargas tu CV, constancia fiscal, título y cédula.</li>
          <li>La Coordinación Académica revisa tu documentación (máximo 3 días hábiles).</li>
          <li>Eliges fecha y hora para tu entrevista por Google Meet.</li>
          <li>Recibes el resultado una vez confirmado por la dirección de la maestría.</li>
        </ol>
      </div>

      {st.abierta ? (
        <p><a className="btn" href="/registro">Postularme ahora</a></p>
      ) : (
        <div className="msg info">
          {st.razon === "aun-no" ? "La convocatoria aún no abre. Vuelve pronto." : "La convocatoria ya cerró. ¡Gracias por tu interés!"}
        </div>
      )}
    </main>
  );
}
