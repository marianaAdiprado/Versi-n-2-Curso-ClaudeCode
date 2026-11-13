import {cookies} from 'next/headers';import {db} from '@/lib/db';import {token} from '@/lib/auth';import {fecha} from '@/lib/mail';
export const dynamic='force-dynamic';
const A=({id,a,t,children})=><form action="/api/admin/action" method="post"><input type="hidden" name="id" value={id}/><input type="hidden" name="a" value={a}/>{children}<button>{t}</button></form>;
export default async function P(){
 if(cookies().get('adm')?.value!==token())return <><h1>Panel de reclutamiento</h1><form action="/api/admin/login" method="post"><label>Contraseña<input type="password" name="p" required/></label><button>Entrar</button></form></>;
 const {data:L}=await db.from('candidatos').select('*').eq('convocatoria',process.env.CONVOCATORIA).order('created_at');
 const ms=process.env.NEXT_PUBLIC_MAESTRIAS.split(',');
 return <><h1>Panel de reclutamiento</h1>
 <p>{ms.map(m=>`${m}: ${L.filter(c=>c.maestria==m&&c.estado=='Seleccionado').length}/5 seleccionados`).join(' · ')}</p>
 {L.map(c=><div className="row" key={c.id}><strong>{c.nombre}</strong> · {c.maestria}{c.doctorado&&' · doctorado'}<br/>
  <span className="muted">{c.email} · {c.estado}{c.entrevista_inicio&&` · ${fecha(c.entrevista_inicio)}`}</span>
  {c.drive_folder&&<><br/><a href={`https://drive.google.com/drive/folders/${c.drive_folder}`}>Documentos en Drive</a></>}
  {c.estado=='Documentos en revisión'&&<><A id={c.id} a="validar" t="Validar"/><A id={c.id} a="correccion" t="Pedir corrección"><input name="v" placeholder="Motivo" required/></A><A id={c.id} a="nocumple" t="No cumple"/></>}
  {['Entrevista agendada','Entrevistado'].includes(c.estado)&&<A id={c.id} a="propuesta" t="Guardar resultado"><select name="v" defaultValue={c.propuesto||''} required><option value="">Resultado</option><option>Seleccionado</option><option>Banco de reserva</option><option>Rechazado</option></select><input name="nota" placeholder="Notas de la entrevista" defaultValue={c.nota||''}/></A>}
  {c.estado=='Entrevistado'&&<A id={c.id} a="confirmar" t={`Director confirma: ${c.propuesto}`}/>}</div>)}</>}
