# Brief · Reclutamiento de Docentes para Maestrías MX

> Documento de entrada para Claude Code. Las marcas **[SUPUESTO]** son decisiones que no fueron confirmadas y deben validarse antes o durante la construcción.

## Problema que resuelve

El Instituto Universitario del Prado (UdelPrado) necesita reclutar docentes mexicanos para impartir clases en modalidad online en **3 maestrías**. Hoy el proceso es manual: recibir candidatos, revisar si cumplen el perfil, recolectar y validar documentos, agendar entrevistas y comunicar resultados.

La solución automatiza ese flujo de punta a punta para que la coordinadora académica solo intervenga en lo que requiere criterio humano (validar documentos, entrevistar, registrar resultados).

**Meta de éxito:** 5 docentes contratados por maestría (15 en total).
**Escala esperada:** 15 a 20 candidatos por maestría por convocatoria (45 a 60 en total).

**Restricciones de la solución**
- Despliegue en Vercel o similar. La institución no tiene cuenta de Vercel ni dominio. **[SUPUESTO]** Se inicia con subdominio `*.vercel.app`; hay que confirmar con TI y revisar los términos del plan gratuito para uso institucional.
- Base de datos y autenticación: Supabase (plan gratuito).
- Vista de seguimiento para la coordinadora: Google Sheets (sincronizado desde la base de datos).
- Documentos almacenados en Google Drive.
- Agenda: Google Calendar con videollamada en Google Meet.
- Todo en español (México). Horario de referencia: zona horaria de Ciudad de México.

## Usuario principal y roles

| Rol | Quién es | Qué hace en el sistema |
|---|---|---|
| **Candidato** | Docente mexicano interesado | Se registra, sube documentos, agenda entrevista, recibe notificaciones |
| **Coordinadora académica** | Administradora del sistema | Redacta y publica la convocatoria (fuera del sistema), valida documentos (máx. 3 días hábiles), da seguimiento, registra el resultado de la entrevista |
| **Entrevistador** | Una sola persona, de la Coordinación de Producto Académico. **[SUPUESTO]** Puede ser la misma coordinadora académica | Realiza la entrevista por Meet. Disponibilidad: lunes a viernes, 9:00 a 16:00 |
| **Directores de maestría** | Director o directores de cada programa | Confirman el estado final del candidato. Acceso a la carpeta de Drive |

**Usuario principal:** la coordinadora académica (administra y opera todo el flujo).
**Autenticación:** coordinadora, entrevistador y directores entran con cuenta de Google institucional. Los candidatos no necesitan cuenta; acceden por enlaces únicos.

## Pantallas / piezas (lista, en orden del journey)

1. **Convocatoria** (pieza externa). La coordinadora la redacta y publica en LinkedIn y en las redes de UdelPrado. Incluye el enlace al formulario. Tiene fechas de apertura y cierre **aún por definir**, por lo que deben ser configurables en el sistema.
2. **Landing de la convocatoria.** Describe las 3 maestrías, requisitos y el aviso de privacidad.
3. **Formulario de registro y prefiltro.** Datos del candidato y declaración de requisitos. Aplica el descarte automático.
4. **Pantalla "Por el momento no cumples el perfil".** Solo para quien no pasa el prefiltro. También se envía por correo.
5. **Carga de documentos.** Para quien sí pasó el prefiltro. Cuatro archivos obligatorios.
6. **Confirmación de recepción.** Pantalla y correo que indican que la coordinadora revisará en máximo 3 días hábiles.
7. **Panel de la coordinadora: revisión de documentos.** Lista de candidatos por maestría y estatus, visor de documentos y acciones: *Validar*, *Pedir corrección*, *Marcar como no cumple*.
8. **Correo automático de validación.** Confirma que cumple los requisitos e incluye el enlace para agendar.
9. **Pantalla de agenda.** Muestra solo horarios libres de Google Calendar del entrevistador.
10. **Confirmación de entrevista.** Correo e invitación de calendario con enlace de Meet, para el candidato y el entrevistador.
11. **Panel de la coordinadora: resultado de entrevista.** Registro de estado propuesto y notas sobre experiencia temática y docente en línea.
12. **Panel de directores: confirmación final.** Confirman o ajustan el estado de cada entrevistado.
13. **Correos finales.** Seleccionado (se envía contrato), En banco de reserva o Rechazado (mensaje breve).
14. **Tablero de seguimiento** (Google Sheets). Candidatos por maestría y etapa, y contador de seleccionados contra la meta de 5 por maestría.

## Datos por pantalla (qué entra, qué sale)

**2. Landing**
- Entra: configuración de convocatoria (nombre, fechas de apertura y cierre, lista de las 3 maestrías, texto del aviso de privacidad).
- Sale: acceso al formulario solo si la convocatoria está abierta.

**3. Formulario de registro y prefiltro**
- Entra del candidato:
  - Nombre completo, correo electrónico, teléfono.
  - Maestría a la que aplica (selección única de las 3).
  - ¿Cuenta con título y cédula de maestría? (sí/no)
  - ¿Tiene experiencia docente en ambientes virtuales? (sí/no)
  - ¿Reside en la Ciudad de México? (sí/no)
  - Régimen fiscal actual (Persona física con actividad empresarial / Régimen Simplificado de Confianza / Otro).
  - ¿Cuenta con doctorado? (sí/no; deseable, no filtra).
  - Aceptación del aviso de privacidad (obligatoria).
- Sale: registro guardado con estado `En revisión de documentos` (cumple) o `Descartado en prefiltro` (no cumple); enlace único de carga de documentos; correo correspondiente.

**4. No cumple**
- Entra: motivo(s) interno(s) del descarte.
- Sale: mensaje breve al candidato ("por el momento no cumple el perfil", sin detallar el motivo); datos conservados.

**5. Carga de documentos**
- Entra: 4 archivos obligatorios: (1) CV actualizado, (2) constancia de situación fiscal actualizada, (3) título de maestría, (4) cédula profesional de maestría. **[SUPUESTO]** Formato PDF, máximo 10 MB por archivo.
- Sale: archivos guardados en una carpeta de Drive por candidato (organizada por convocatoria y maestría); el envío se bloquea si falta cualquiera de los 4.

**6. Confirmación de recepción**
- Entra: registro completo.
- Sale: correo de acuse con fecha límite estimada de respuesta (3 días hábiles).

**7. Panel de revisión**
- Entra: lista de candidatos con estado, documentos y datos declarados.
- Sale: decisión de la coordinadora (`Validado`, `Corrección solicitada` con motivo, `No cumple`) con fecha y hora.

**8-10. Validación y agenda**
- Entra: candidato validado.
- Sale: correo con enlace único de agenda; horarios disponibles (lunes a viernes, 9:00 a 16:00, zona CDMX); evento en Google Calendar con enlace de Meet; estado `Entrevista agendada`. **[SUPUESTO]** Duración de 45 minutos.

**11. Resultado de entrevista**
- Entra: la entrevista valida que se cumplen los requisitos iniciales y pide detalle de la experiencia en el área temática y en docencia online. Se capturan notas libres.
- Sale: estado propuesto: `Seleccionado`, `En banco de reserva` o `Rechazado`.

**12. Confirmación de directores**
- Entra: estado propuesto, notas y documentos.
- Sale: estado final confirmado, con fecha y quién lo confirmó.

**13. Correos finales**
- `Seleccionado`: aviso a la coordinadora para enviar el contrato. **[SUPUESTO]** El sistema no genera ni envía el contrato.
- `En banco de reserva` / `Rechazado`: mensaje breve y amable al candidato.

**14. Tablero**
- Sale: una fila por candidato (maestría, estado, fechas por etapa, estado final) y conteo de seleccionados por maestría contra la meta de 5.

## Reglas de negocio (los "si... entonces...")

**Convocatoria y registro**
- Si la convocatoria está fuera de las fechas de apertura y cierre, entonces el formulario no se muestra.
- Si el candidato no acepta el aviso de privacidad, entonces no puede enviar el formulario.
- Si ya existe un registro con el mismo correo en la misma convocatoria, entonces se bloquea el nuevo registro (solo se puede aplicar a una maestría).

**Prefiltro (descarte automático)**
- Si el candidato declara **no** tener título y cédula de maestría, **o** no tener experiencia docente en ambientes virtuales, **o** no residir en la CDMX, **o** un régimen fiscal distinto a *Persona física con actividad empresarial* o *Régimen Simplificado de Confianza*, entonces se descarta de inmediato al registrarse.
- Si se descarta, entonces se envía un mensaje breve indicando que por el momento no cumple el perfil, y sus datos se conservan.
- Si cumple todo, entonces pasa a la carga de documentos.
- Si tiene doctorado, entonces se marca como dato deseable; no afecta el descarte, pero se muestra a la coordinadora.

**Documentos**
- Si falta cualquiera de los 4 documentos, entonces no se permite enviar la carga.
- Si la coordinadora marca un documento como ilegible, entonces el estado pasa a `Corrección solicitada` y se envía al candidato un correo con el motivo y su enlace para volver a cargarlo. **[SUPUESTO]** Plazo de 5 días hábiles para corregir; si no corrige, se cierra el expediente.
- Si pasan 3 días hábiles sin revisión, entonces se envía un recordatorio a la coordinadora.
- La validación es solo visual; no se verifica la cédula contra el Registro Nacional de Profesionistas de la SEP.
- Si la coordinadora marca `No cumple` tras revisar (por ejemplo, un régimen fiscal distinto al declarado), entonces se notifica al candidato con el mensaje breve de descarte. **[SUPUESTO]**
- Si la coordinadora valida, entonces se envía el correo de confirmación con el enlace de agenda.

**Entrevista**
- Si el candidato abre el enlace de agenda, entonces solo ve horarios libres del entrevistador (lunes a viernes, 9:00 a 16:00).
- Si el candidato elige un horario, entonces se crea el evento con Meet, se invita a ambos y el horario se bloquea.
- Si el candidato no agenda en un plazo definido, entonces se envía un recordatorio. **[SUPUESTO]** Recordatorio a los 3 días y cierre a los 7.
- Cada candidato tiene una sola entrevista activa.
- Reagendamientos y cancelaciones los gestiona la coordinadora manualmente.

**Resultado y cierre**
- Cada entrevistado recibe uno de tres estados: `Seleccionado`, `En banco de reserva`, `Rechazado`.
- Si el entrevistador propone un estado, entonces el director o directores de la maestría deben confirmarlo antes de notificar al candidato.
- Si el estado final es `Seleccionado`, entonces se notifica a la coordinadora para enviar el contrato.
- Si es `En banco de reserva` o `Rechazado`, entonces se envía un mensaje breve al candidato.
- Si una maestría llega a 5 seleccionados, entonces el tablero lo indica como meta cumplida (no bloquea nuevas selecciones).

**Privacidad y acceso**
- Los documentos solo son accesibles por la coordinadora académica y los directores de la maestría correspondiente.
- El formulario muestra el aviso de privacidad y protección de datos y documentos.
- Los expedientes (datos y documentos, incluidos los de descartados) se conservan 2 años. **[SUPUESTO]** El plazo se cuenta desde la fecha de registro. Al cumplirse, se avisa a la coordinadora para eliminarlos.

## Fuera de alcance (qué NO se construye en esta versión)

- Verificación automática de la cédula en el Registro Nacional de Profesionistas de la SEP.
- Lectura automática de PDFs (por ejemplo, extraer el régimen fiscal de la constancia).
- Integración con monday (el seguimiento será en Google Sheets).
- Redacción de la convocatoria y publicación automática en LinkedIn o en redes sociales.
- Generación, firma y envío automatizado del contrato.
- Alta fiscal, inducción y cualquier trámite posterior a la selección.
- Más de un entrevistador o rotación de agendas.
- Rúbrica de evaluación con puntaje (solo notas libres).
- Aplicación a más de una maestría por candidato.
- Reagendamiento por autoservicio del candidato.
- Candidatos fuera de la CDMX o extranjeros.
- Validación o verificación de títulos de licenciatura.
- Aplicación móvil nativa y múltiples idiomas.
