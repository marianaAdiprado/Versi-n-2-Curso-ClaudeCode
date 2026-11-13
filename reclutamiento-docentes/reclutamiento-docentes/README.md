# Reclutamiento de Docentes · Maestrías MX

Web app (Next.js + Vercel) que automatiza el flujo del `BRIEF.md`: registro con prefiltro, carga de documentos, revisión, agenda de entrevista (Google Calendar + Meet), resultado y confirmación de direcciones.

**Sin Supabase.** Todo vive en Google Workspace:

| Qué | Dónde |
|---|---|
| Base de datos (candidatos, estados) | Hoja de cálculo de Google (pestaña `Candidatos`, se crea sola) |
| Documentos de cada candidato | Carpeta de Google Drive |
| Entrevistas | Google Calendar + Google Meet |
| Correos | Gmail API (sale de la cuenta autorizada) |
| Acceso al panel | Inicio de sesión con Google + lista de correos permitidos |

Los candidatos no tienen cuenta: usan enlaces personales firmados que les llegan por correo.

## 1. Configurar Google Cloud (una vez)

1. Crea un proyecto en <https://console.cloud.google.com>.
2. Activa estas APIs: **Google Drive API, Google Sheets API, Google Calendar API, Gmail API**.
3. **Pantalla de consentimiento OAuth → tipo "Interno"** (requiere que la cuenta sea de Google Workspace de la institución). Importante: si la dejas como "Externa" en modo prueba, el refresh token caduca a los 7 días y el sistema deja de funcionar.
4. **Credenciales → Crear ID de cliente OAuth → Aplicación web.** Agrega estas URI de redirección:
   - `http://localhost:3000/api/auth/callback`
   - `https://TU-APP.vercel.app/api/auth/callback` (o tu dominio)
   - `http://localhost:53682/callback` (solo para obtener el token)
5. Copia `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

## 2. Preparar Drive y la hoja

1. En Drive crea una carpeta (ej. "Reclutamiento docente") y copia su ID (lo que va después de `/folders/` en la URL) → `DRIVE_ROOT_FOLDER_ID`.
2. Comparte esa carpeta con la coordinadora y las direcciones de maestría. **Nadie más debe tener acceso.**
3. Crea una hoja de cálculo vacía y copia su ID → `SHEET_ID`. Compártela con la coordinadora (vista de seguimiento).
4. Calendario: si el entrevistador no es la cuenta autorizada, comparte su calendario con ella ("Hacer cambios en eventos") y pon su ID en `CALENDAR_ID` y su correo en `ENTREVISTADOR_EMAIL`.

## 3. Variables de entorno

```bash
cp .env.example .env.local
# completa los valores; genera APP_SECRET y CRON_SECRET con: openssl rand -base64 32
npm install
npm run token     # abre la URL, inicia sesión con la cuenta que operará el sistema y copia GOOGLE_REFRESH_TOKEN a .env.local
npm run dev       # http://localhost:3000
```

La cuenta que autorices será la dueña de las carpetas, enviará los correos y creará los eventos de Calendar. Conviene usar una cuenta institucional tipo `reclutamiento@…` o la de la coordinadora.

Para probar el panel agrega tu correo en `COORDINADORA_EMAILS` **y** en `DIRECTOR_EMAILS` (solo los directores pueden confirmar el estado final).

## 4. Desplegar en Vercel

1. Sube el proyecto a un repositorio (GitHub) e impórtalo en <https://vercel.com/new>.
2. En *Settings → Environment Variables* pega todas las variables de `.env.example` con sus valores reales. `APP_URL` = URL pública final, sin `/` al final.
3. Despliega y agrega la URI `https://TU-DOMINIO/api/auth/callback` en tu cliente OAuth si aún no lo hiciste.
4. `vercel.json` ya programa un cron diario (9:00 h CDMX) que envía recordatorios y el resumen a la coordinadora. Vercel lo llama con `CRON_SECRET`.

> Revisa con TI los términos del plan de Vercel: el plan gratuito (Hobby) está pensado para uso personal no comercial; para uso institucional puede requerirse un plan de pago.

## 5. Prueba de punta a punta

1. `/registro` con un perfil que **no** cumple → llega correo de descarte y aparece "Descartado en prefiltro" en la hoja.
2. `/registro` con un perfil válido → se crea carpeta en Drive y llega el enlace de carga.
3. Sube los 4 documentos → estado "En revisión", aviso a la coordinadora.
4. En `/admin` prueba *Pedir corrección*, *Validar*; el candidato recibe el enlace de agenda.
5. Elige horario → evento con Meet en Calendar e invitación al candidato.
6. Registra resultado (coordinadora) y confirma (director) → correos finales.

## Reglas implementadas

- Prefiltro al registrarse: título y cédula de maestría, experiencia docente virtual, residir en CDMX y régimen fiscal permitido; si falla, se descarta, se avisa con un mensaje breve y se conservan los datos.
- Un correo = una postulación por convocatoria.
- No se puede enviar la carga sin los 4 documentos. Ilegible → "Corrección solicitada" con enlace para resubir (5 días hábiles; después se cierra).
- Revisión: 3 días hábiles (recordatorio a la coordinadora). Validado sin agendar: recordatorio a los 3 días, cierre a los 7.
- Agenda: lunes a viernes 9:00–16:00 (CDMX), citas de `SLOT_MINUTES` (45 por defecto), mínimo 24 h de anticipación, próximos 14 días; se vuelve a verificar la disponibilidad al reservar.
- Estados finales: Seleccionado / En banco de reserva / Rechazado, confirmados por un director. Seleccionado → aviso a la coordinadora para enviar contrato; los demás → mensaje breve al candidato.
- Retención: a los 2 años del registro se avisa a la coordinadora para eliminar datos y carpeta (la eliminación es manual).

## Limitaciones conocidas

- Cada archivo pesa máximo **4 MB** (límite de cuerpo de las funciones de Vercel), no 10 MB. Si se necesita más, hay que pasar a subida directa a Drive (sesión reanudable).
- Los días hábiles no consideran festivos.
- Las direcciones ven y confirman a todos los candidatos, sin filtrar por maestría.
- No hay reagendamiento por autoservicio ni cancelación de eventos; lo hace la coordinadora en Calendar.
- La hoja se escribe fila a fila: con el volumen esperado (45–60 candidatos) no hay problema, pero no está pensada para escrituras muy concurrentes.
- Si editas a mano la columna `estado` de la hoja, usa exactamente los textos existentes.
- El texto de `content/aviso-privacidad.ts` es un borrador: reemplázalo por el aviso oficial validado por jurídico.

## Estructura

```
app/            páginas (landing, registro, subir, agenda, admin) y rutas /api
components/     formularios y acciones (cliente)
lib/            Google (Drive, Sheets, Calendar, Gmail), sesión, correos, agenda, prefiltro
content/        aviso de privacidad
scripts/        get-refresh-token.mjs
```
