import { db, BUCKET, DOCS, sendEmail, slots, fmt } from './_lib.js';
export default async function handler(req, res) {
  const t = req.query.t || req.body?.t;
  const { data: c } = await db.from('candidates').select('*').eq('token', t || '').maybeSingle();
  if (!c) return res.status(404).json({ error: 'Enlace no válido.' });
  if (req.method === 'GET') {
    let libres = [];
    if (c.status === 'validado') {
      const { data: tom } = await db.from('candidates').select('slot').not('slot', 'is', null);
      const ocupados = new Set(tom.map(r => new Date(r.slot).getTime()));
      libres = slots().filter(s => !ocupados.has(new Date(s).getTime()));
    }
    return res.json({ nombre: c.nombre, maestria: c.maestria, status: c.status, motivo: c.motivo, slot: c.slot, meet_link: c.meet_link, libres });
  }
  const { action } = req.body || {};
  const editable = ['docs_pendientes', 'correccion_solicitada'].includes(c.status);
  if (action === 'upload_urls' && editable) {
    const urls = {};
    for (const d of DOCS) { const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(`${c.id}/${d}.pdf`, { upsert: true });
      if (error) return res.status(500).json({ error: 'No pudimos preparar la carga.' }); urls[d] = data.signedUrl; }
    return res.json({ urls });
  }
  if (action === 'submit_docs' && editable) {
    const { data: files } = await db.storage.from(BUCKET).list(c.id);
    const have = new Set((files || []).map(f => f.name));
    if (!DOCS.every(d => have.has(`${d}.pdf`))) return res.status(400).json({ error: 'Faltan documentos. Los cuatro son obligatorios.' });
    await db.from('candidates').update({ status: 'en_revision', motivo: null }).eq('id', c.id);
    await sendEmail(c.correo, 'Recibimos tus documentos', `Hola ${c.nombre}, la coordinación académica los revisará en un máximo de 3 días hábiles.`);
    return res.json({ ok: true });
  }
  if (action === 'book' && c.status === 'validado') {
    const s = req.body.slot;
    if (!slots().includes(s)) return res.status(400).json({ error: 'Horario no válido.' });
    const { error } = await db.from('candidates').update({ slot: s, status: 'entrevista_agendada' }).eq('id', c.id);
    if (error) return res.status(409).json({ error: 'Ese horario ya fue tomado. Elige otro.' });
    await sendEmail(c.correo, 'Entrevista agendada', `Hola ${c.nombre}, tu entrevista es el ${fmt(s)} (hora CDMX). Te enviaremos el enlace de Meet.`);
    return res.json({ ok: true });
  }
  res.status(400).json({ error: 'Acción no disponible en tu estado actual.' });
}
