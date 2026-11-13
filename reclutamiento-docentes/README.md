# Reclutamiento de Docentes para Maestrías MX

Web app mínima según BRIEF.md. Vercel (estático + funciones `api/`) y Supabase (base de datos y archivos).

## Puesta en marcha
1. En Supabase: crea un proyecto y ejecuta `supabase/schema.sql` en el SQL Editor (crea la tabla y el bucket privado `documentos`).
2. Copia `.env.example` a las variables de entorno de Vercel (Settings → Environment Variables) con tus valores. `SUPABASE_SERVICE_KEY` es la clave service_role: nunca va en el navegador.
3. Sube la carpeta a un repo de GitHub, impórtalo en vercel.com y despliega. No requiere build.
4. Candidatos: `/` · Coordinadora y direcciones: `/admin.html`.

## Qué cubre
Registro con prefiltro y descarte automático · carga de 4 PDF obligatorios · panel para validar, pedir corrección o descartar · agenda L–V 9:00–16:00 (bloques de 45 min) · registro de entrevista y confirmación final · correos en cada paso.

## Diferencias frente al BRIEF (pendientes)
- Documentos en **Supabase Storage**, no en Google Drive.
- Agenda con horarios propios, **sin Google Calendar**; el enlace de Meet lo pega la coordinadora.
- Correos: sin `RESEND_API_KEY` solo se escriben en los logs de Vercel.
- Acceso al panel con una **contraseña compartida**, no con cuentas de Google ni roles separados para directores.
- Sin recordatorios automáticos, sin sincronización a Google Sheets y sin borrado a los 2 años.
- Confirmar con TI si el plan gratuito de Vercel es válido para uso institucional.
