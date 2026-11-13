# Reclutamiento de Docentes · Maestrías MX
Web app (Next.js + Supabase + Google Drive/Calendar) según BRIEF.md.
1. Supabase: crea un proyecto y ejecuta `supabase/schema.sql`.
2. Google Cloud: crea una cuenta de servicio, activa las APIs de Drive y Calendar, y pide al administrador de Workspace la delegación en todo el dominio para los scopes `drive` y `calendar`. `INTERVIEWER_EMAIL` es la cuenta que será suplantada (dueña de la agenda y de la carpeta de Drive `DRIVE_FOLDER_ID`).
3. Correo: usa una cuenta de Workspace con contraseña de aplicación (SMTP, puerto 465).
4. Copia `.env.example` a `.env.local` y llénalo. `npm install && npm run dev`.
5. Vercel: sube el repo, agrega las mismas variables en Project Settings y despliega. Actualiza `APP_URL` con la URL final.
Rutas: `/` registro · `/subir/<token>` documentos · `/agenda/<token>` entrevista · `/admin` panel.
