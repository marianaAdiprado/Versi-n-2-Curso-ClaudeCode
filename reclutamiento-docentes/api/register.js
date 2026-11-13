import { db, sendEmail, maestrias, appUrl, abierta } from './_lib.js';
const REGIMENES = ['Persona física con actividad empresarial', 'Régimen Simplificado de Confianza'];
export default async function handler(req, res) {
  if (req.method === 'GET') return res.json({ maestrias: maestrias(), abierta: abierta(), regimenes: REGIMENES });
  if (req.method !== 'POST') return res.status(405).end();
  if (!abierta()) return res.status(403).json({ error: 'La convocatoria no está abierta.' });
  const b = req.body || {};
  if (!b.nombre?.trim() || !/^\S+@\S+\.\S+$/.test(b.correo || '') || !maestrias().includes(b.maestria) || !b.privacidad)
    return res.status(400).json({ error: 'Completa los campos obligatorios y acepta el aviso de privacidad.' });
  const cumple = !!(b.titulo && b.exp_virtual && b.reside_cdmx && REGIMENES.includes(b.regimen));
  const { data, error } = await db.from('candidates').insert({
    nombre: b.nombre.trim(), correo: b.correo.trim().toLowerCase(), telefono: b.telefono || null, maestria: b.maestria,
    titulo_maestria: !!b.titulo, exp_virtual: !!b.exp_virtual, reside_cdmx: !!b.reside_cdmx, regimen: b.regimen || null,
    doctorado: !!b.doctorado, status: cumple ? 'docs_pendientes' : 'descartado_prefiltro' }).select('token').single();
  if (error) return res.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'Ya existe un registro con este correo.' : 'No pudimos guardar tu registro. Intenta de nuevo.' });
  if (!cumple) {
    await sendEmail(b.correo, 'Tu postulación docente', `Hola ${b.nombre}, gracias por tu interés. Por el momento no cumples el perfil solicitado. Conservaremos tus datos para futuras convocatorias.`);
    return res.json({ cumple: false });
  }
  const link = `${appUrl(req)}/candidato.html?t=${data.token}`;
  await sendEmail(b.correo, 'Continúa tu postulación: sube tus documentos', `Hola ${b.nombre}, cumples el perfil inicial. Sube tus documentos aquí: ${link}`);
  res.json({ cumple: true, token: data.token });
}
