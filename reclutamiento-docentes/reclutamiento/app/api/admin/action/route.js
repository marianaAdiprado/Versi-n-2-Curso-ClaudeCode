import {NextResponse as R} from 'next/server';import {cookies} from 'next/headers';
import {db} from '@/lib/db';import {token} from '@/lib/auth';import {send,M} from '@/lib/mail';
export async function POST(r){
 if(cookies().get('adm')?.value!==token())return new R('No autorizado',{status:401});
 const f=await r.formData(),a=f.get('a'),v=f.get('v')||'';
 const {data:c}=await db.from('candidatos').select('*').eq('id',f.get('id')).single();
 const up=o=>db.from('candidatos').update(o).eq('id',c.id),B=process.env.APP_URL;
 if(a=='validar'){await up({estado:'Validado'});await send(c.email,M.validado(c,`${B}/agenda/${c.token}`))}
 if(a=='correccion'){await up({estado:'Corrección solicitada',nota:v});await send(c.email,M.correccion(c,`${B}/subir/${c.token}`,v))}
 if(a=='nocumple'){await up({estado:'Descartado tras revisión'});await send(c.email,M.descarte())}
 if(a=='propuesta')await up({estado:'Entrevistado',propuesto:v,nota:f.get('nota')||c.nota});
 if(a=='confirmar'&&c.propuesto){await up({estado:c.propuesto});
  if(c.propuesto=='Seleccionado')await send(process.env.COORDINATOR_EMAIL,M.contrato(c));
  else await send(c.email,c.propuesto=='Rechazado'?M.rechazo(c):M.pausa(c));}
 return R.redirect(new URL('/admin',r.url),303);}
