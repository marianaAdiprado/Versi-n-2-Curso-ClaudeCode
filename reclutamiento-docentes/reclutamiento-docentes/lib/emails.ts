import { cfg, fmtDateTime } from "./config";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(title: string, body: string) {
  const inst = esc(cfg().institucion);
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2a44;line-height:1.55">
<div style="background:#1f3a5f;color:#fff;padding:16px 20px;border-radius:10px 10px 0 0;font-size:15px">${inst}</div>
<div style="border:1px solid #e3e8f0;border-top:0;padding:22px 20px;border-radius:0 0 10px 10px">
<h2 style="margin:0 0 12px;font-size:19px;color:#1f3a5f">${esc(title)}</h2>
${body}
<p style="margin-top:24px">Con aprecio,<br><strong>Coordinación Académica</strong><br>${inst}</p>
</div></div>`;
}
const btn = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${esc(href)}" style="background:#e07a2f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:bold">${esc(label)}</a></p>`;

export const mail = {
  registro: (nombre: string, link: string) => ({
    subject: "Recibimos tu registro · Siguiente paso: tus documentos",
    html: layout(
      `¡Gracias por postularte, ${nombre}!`,
      `<p>Tu registro cumple con el perfil inicial. Nos entusiasma la posibilidad de contar contigo en nuestras maestrías en línea.</p>
<p>El siguiente paso es cargar tu CV, constancia de situación fiscal, título y cédula de maestría:</p>${btn(link, "Cargar mis documentos")}
<p style="font-size:13px;color:#5b6678">Este enlace es personal. Si no lo usas ahora, puedes volver a él cuando quieras.</p>`,
    ),
  }),
  descarte: (nombre: string) => ({
    subject: "Tu postulación docente",
    html: layout(
      `Gracias por tu interés, ${nombre}`,
      `<p>Hemos revisado tu postulación y, por el momento, no cumple el perfil de esta convocatoria.</p>
<p>Valoramos mucho tu interés y tu tiempo. Conservamos tus datos para considerarte en futuras convocatorias y te invitamos a seguir atento a ellas.</p>`,
    ),
  }),
  recepcion: (nombre: string) => ({
    subject: "Recibimos tus documentos",
    html: layout(
      `Documentos recibidos, ${nombre}`,
      `<p>¡Gracias! Ya tenemos tu documentación. La Coordinación Académica la revisará en un máximo de <strong>3 días hábiles</strong> y te escribiremos con los siguientes pasos.</p>`,
    ),
  }),
  correccion: (nombre: string, motivo: string, link: string) => ({
    subject: "Necesitamos que corrijas un documento",
    html: layout(
      `Un pequeño ajuste, ${nombre}`,
      `<p>Al revisar tu documentación encontramos algo que necesita corrección:</p>
<blockquote style="margin:12px 0;padding:10px 14px;background:#f4f6fa;border-left:4px solid #e07a2f">${esc(motivo)}</blockquote>
<p>Puedes volver a cargar el documento aquí:</p>${btn(link, "Corregir mis documentos")}
<p style="font-size:13px;color:#5b6678">Contamos con tu respuesta en un plazo de 5 días hábiles.</p>`,
    ),
  }),
  validado: (nombre: string, link: string) => ({
    subject: "¡Cumples los requisitos! Agenda tu entrevista",
    html: layout(
      `¡Buenas noticias, ${nombre}!`,
      `<p>Validamos tu documentación y cumples con los requisitos. El siguiente paso es una entrevista por videollamada (Google Meet) con la Coordinación de Producto Académico.</p>
${btn(link, "Elegir fecha y hora")}
<p style="font-size:13px;color:#5b6678">Horarios disponibles de lunes a viernes, de 9:00 a 16:00 h (hora de Ciudad de México).</p>`,
    ),
  }),
  recordatorioAgenda: (nombre: string, link: string) => ({
    subject: "Recordatorio: agenda tu entrevista",
    html: layout(
      `Aún estás a tiempo, ${nombre}`,
      `<p>Todavía no has elegido horario para tu entrevista. Nos encantaría conocerte:</p>${btn(link, "Elegir fecha y hora")}`,
    ),
  }),
  entrevista: (nombre: string, iso: string, meet: string) => ({
    subject: "Entrevista confirmada",
    html: layout(
      `Tu entrevista está confirmada, ${nombre}`,
      `<p><strong>${esc(fmtDateTime(iso))}</strong> (hora de Ciudad de México)</p>
${meet ? btn(meet, "Entrar a Google Meet") : ""}
<p>También recibirás la invitación en tu calendario. Prepara una descripción de tu experiencia en el área temática y en docencia en modalidad en línea.</p>`,
    ),
  }),
  banco: (nombre: string) => ({
    subject: "Sobre tu proceso de entrevista",
    html: layout(
      `Gracias por tu tiempo, ${nombre}`,
      `<p>Fue un gusto conocerte. Por ahora tu proceso queda en pausa dentro de nuestro banco de reserva y te contactaremos si surge una vacante acorde a tu perfil.</p>`,
    ),
  }),
  rechazo: (nombre: string) => ({
    subject: "Sobre tu proceso de entrevista",
    html: layout(
      `Gracias por tu tiempo, ${nombre}`,
      `<p>Agradecemos sinceramente tu interés y el tiempo que dedicaste al proceso. En esta ocasión no continuaremos con tu candidatura. Te deseamos mucho éxito en tu trayectoria docente.</p>`,
    ),
  }),
  // ── Internos (coordinación) ─────────────────────────────────────
  nuevosDocs: (nombre: string, maestria: string, link: string) => ({
    subject: `Documentos por revisar · ${nombre}`,
    html: layout(
      "Nueva documentación recibida",
      `<p><strong>${esc(nombre)}</strong> (${esc(maestria)}) cargó sus documentos. Tienes 3 días hábiles para revisarlos.</p>${btn(link, "Abrir en el panel")}`,
    ),
  }),
  seleccionado: (nombre: string, maestria: string, link: string) => ({
    subject: `Seleccionado · enviar contrato a ${nombre}`,
    html: layout(
      "Candidato seleccionado",
      `<p>Los directores confirmaron a <strong>${esc(nombre)}</strong> (${esc(maestria)}) como <strong>Seleccionado</strong>. Falta enviar el contrato.</p>${btn(link, "Ver expediente")}`,
    ),
  }),
  resumen: (secciones: { titulo: string; items: string[] }[]) => ({
    subject: "Resumen diario · reclutamiento docente",
    html: layout(
      "Pendientes del proceso",
      secciones
        .map((s) => `<p><strong>${esc(s.titulo)}</strong></p><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`)
        .join(""),
    ),
  }),
};
