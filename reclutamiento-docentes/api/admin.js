import { db, BUCKET, DOCS, sendEmail, appUrl, fmt, isAdmin } from './_lib.js';
export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Contraseña incorrecta.' });
  if (req.method === 'GET') {
    if (req.query.docs) { const out = {};
      for (const d of DOCS) { const { data } = await db.storage.from(BUCKET).createSignedUrl(`${req.query.docs}/${d}.pdf`, 3600); if (data) out[d] = data.signedUrl; }
      return res.json(out); }
    const { data } = await db.from('candidates').select('*').order('created_at', { ascending: false });
    return res.json(data);
  }
  const { id, action, motivo, link, estado, notas } = req.body || {};
  const { data: c } = await db.from('candidates').select('*').eq('id', id).maybeSingle();
  if (!c) return res.status(404).json({ error: 'Candidato no encontrado.' });
  const up = f => db.from('candidates').update(f).eq('id', id);
  const mail = (s, t) => sendEmail(c.correo, s, `Hola ${c.nombre}, ${t}`);
  const agenda = `${appUrl(req)}/candidato.html?t=${c.token}`;
  if (action === 'validar') { await up({ status: 'validado' }); await mail('Documentos validados: agenda tu entrevista', `tus documentos fueron validados. Agenda tu entrevista aquí: ${agenda}`); }
  else if (action === 'correccion') { await up({ status: 'correccion_solicitada', motivo }); await mail('Necesitamos una corrección', `debes corregir un documento: ${motivo}. Súbelo de nuevo aquí: ${agenda}`); }
  else if (action === 'no_cumple') { await up({ status: 'no_cumple' }); await mail('Tu postulación docente', 'por el momento no cumples el perfil solicitado. Conservaremos tus datos para futuras convocatorias.'); }
  else if (action === 'meet') { await up({ meet_link: link }); await mail('Enlace de tu entrevista', `tu entrevista es el ${fmt(c.slot)} (hora CDMX). Enlace de Meet: ${link}`); }
  else if (action === 'entrevista') await up({ status: 'entrevistado', estado_propuesto: estado, notas });
  else if (action === 'final' && ['seleccionado', 'banco_reserva', 'rechazado'].includes(estado)) {
    await up({ status: estado, estado_final: estado });
    if (estado === 'seleccionado') await sendEmail(process.env.ADMIN_EMAIL, `Enviar contrato: ${c.nombre}`, `${c.nombre} (${c.maestria}) fue seleccionado/a. Envía el contrato a ${c.correo}.`);
    else await mail('Resultado de tu postulación docente', estado === 'banco_reserva' ? 'gracias por tu entrevista. Quedas en nuestro banco de reserva y te contactaremos si surge una vacante.' : 'gracias por tu entrevista. En esta ocasión no continuaremos con tu proceso.');
  } else return res.status(400).json({ error: 'Acción no válida.' });
  res.json({ ok: true });
}
