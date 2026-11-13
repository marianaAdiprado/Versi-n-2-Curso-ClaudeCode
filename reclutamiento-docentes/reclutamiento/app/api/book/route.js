import {NextResponse as R} from 'next/server';
import {db} from '@/lib/db';import {slots,agendar} from '@/lib/google';import {send,M} from '@/lib/mail';
export async function POST(r){
 const {token,start}=await r.json();
 const {data:c}=await db.from('candidatos').select('*').eq('token',token).single();
 if(c?.estado!='Validado')return R.json({error:'Este enlace no está disponible.'},{status:400});
 if(!(await slots()).includes(new Date(start).toISOString()))return R.json({error:'Ese horario ya no está disponible. Recarga la página y elige otro.'},{status:409});
 const meet=await agendar(c,start);
 await db.from('candidatos').update({estado:'Entrevista agendada',entrevista_inicio:start,meet_link:meet}).eq('id',c.id);
 await send(c.email,M.agendada(c,meet,start));return R.json({meet});}
