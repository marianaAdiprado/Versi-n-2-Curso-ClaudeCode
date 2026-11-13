export const ESTADOS = {
  PENDIENTE_DOCS: "Pendiente de documentos",
  EN_REVISION: "En revisión de documentos",
  CORRECCION: "Corrección solicitada",
  DESCARTADO: "Descartado en prefiltro",
  NO_CUMPLE: "No cumple (tras revisión)",
  VALIDADO: "Validado, pendiente de agenda",
  AGENDADA: "Entrevista agendada",
  ENTREVISTADO: "Entrevistado, pendiente de confirmación",
  SELECCIONADO: "Seleccionado",
  BANCO: "En banco de reserva",
  RECHAZADO: "Rechazado",
  CERRADO: "Cerrado sin respuesta",
} as const;

export type Estado = (typeof ESTADOS)[keyof typeof ESTADOS];

export const RESULTADOS = [ESTADOS.SELECCIONADO, ESTADOS.BANCO, ESTADOS.RECHAZADO] as const;
export type Resultado = (typeof RESULTADOS)[number];

// Orden = columnas de la hoja "Candidatos".
export const COLUMNS = [
  "id",
  "creado",
  "convocatoria",
  "nombre",
  "email",
  "telefono",
  "maestria",
  "doctorado",
  "regimen",
  "estado",
  "estadoDesde",
  "motivo",
  "carpetaId",
  "carpetaUrl",
  "entrevista",
  "meetUrl",
  "eventoId",
  "estadoPropuesto",
  "notas",
  "confirmadoPor",
  "recordatorios",
  "actualizado",
] as const;

export type ColumnKey = (typeof COLUMNS)[number];
export type Candidate = Record<ColumnKey, string>;

export const DOCS = [
  { key: "cv", prefix: "01-CV", label: "Curriculum vitae actualizado" },
  { key: "csf", prefix: "02-Constancia-situacion-fiscal", label: "Constancia de situación fiscal actualizada" },
  { key: "titulo", prefix: "03-Titulo-maestria", label: "Título de maestría" },
  { key: "cedula", prefix: "04-Cedula-maestria", label: "Cédula profesional de maestría" },
] as const;

export const REGIMENES = [
  "Persona física con actividad empresarial",
  "Régimen Simplificado de Confianza (RESICO)",
  "Otro",
] as const;
export const REGIMENES_VALIDOS: readonly string[] = [REGIMENES[0], REGIMENES[1]];
