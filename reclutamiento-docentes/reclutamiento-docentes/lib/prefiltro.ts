import { REGIMENES_VALIDOS } from "./types";

export type Declaracion = {
  tituloMaestria: boolean;
  expVirtual: boolean;
  resideCdmx: boolean;
  regimen: string;
};

/** Devuelve los motivos internos de descarte (vacío = cumple). */
export function prefiltro(d: Declaracion): string[] {
  const m: string[] = [];
  if (!d.tituloMaestria) m.push("Sin título y cédula de maestría");
  if (!d.expVirtual) m.push("Sin experiencia docente en ambientes virtuales");
  if (!d.resideCdmx) m.push("No reside en la CDMX");
  if (!REGIMENES_VALIDOS.includes(d.regimen)) m.push(`Régimen fiscal no permitido (${d.regimen})`);
  return m;
}
