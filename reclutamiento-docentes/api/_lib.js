import { createClient } from '@supabase/supabase-js';
export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
export const BUCKET = 'documentos';
export const DOCS = ['cv', 'constancia', 'titulo', 'cedula'];
export const maestrias = () => (process.env.MAESTRIAS || '').split(',').map(s => s.trim()).filter(Boolean);
export const appUrl = req => process.env.APP_URL || `https://${req.headers.host}`;
export const isAdmin = req => !!process.env.ADMIN_PASSWORD && req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
export const abierta = () => { const n = Date.now(), { OPEN_DATE: o, CLOSE_DATE: c } = process.env; return !((o && n < Date.parse(o)) || (c && n > Date.parse(c))); };
// Envía con Resend si hay RESEND_API_KEY; si no, solo registra en los logs de Vercel.
export async function sendEmail(to, subject, text) {
  if (!process.env.RESEND_API_KEY) return console.log('[EMAIL]', to, '|', subject, '|', text);
  await fetch('https://api.resend.com/emails', { method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text }) });
}
// Horarios: lunes a viernes, 9:00-16:00 (CDMX, UTC-6), bloques de 45 min, próximos 10 días hábiles.
export function slots() {
  const out = [], d = new Date(Date.now() - 6 * 3600e3); let n = 0;
  while (n < 10) { d.setUTCDate(d.getUTCDate() + 1); const w = d.getUTCDay(); if (w === 0 || w === 6) continue; n++;
    for (let m = 540; m + 45 <= 960; m += 45) out.push(`${d.toISOString().slice(0, 10)}T${String(m / 60 | 0).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00-06:00`); }
  return out;
}
export const fmt = iso => new Date(iso).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'full', timeStyle: 'short' });
