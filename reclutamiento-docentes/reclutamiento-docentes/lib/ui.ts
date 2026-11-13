import { ESTADOS } from "./types";

export function tagClass(estado: string) {
  if ([ESTADOS.SELECCIONADO].some((e) => e === estado)) return "ok";
  if ([ESTADOS.DESCARTADO, ESTADOS.NO_CUMPLE, ESTADOS.RECHAZADO, ESTADOS.CERRADO].some((e) => e === estado)) return "bad";
  if ([ESTADOS.EN_REVISION, ESTADOS.CORRECCION, ESTADOS.ENTREVISTADO].some((e) => e === estado)) return "warn";
  return "";
}
