import {NextResponse as R} from 'next/server';
import {db} from '@/lib/db';import {send,M} from '@/lib/mail';
export async function POST(r){
 const b=await r.json(),n=Date.now(),o=process.env.CONV_OPEN,c=process.env.CONV_CLOSE;
 if((o&&n<+new Date(o))||(c&&n>+new Date(c)))return R.json({error:'La convocatoria está cerrada.'},{status:400});
 if(!b.nombre||!b.email||!b.privacidad||!process.env.NEXT_PUBLIC_MAESTRIAS.split(',').includes(b.maestria))return R.json({error:'Revisa los datos del formulario.'},{status:400});
 const ok=b.titulo=='si'&&b.experiencia=='si'&&b.cdmx=='si'&&['empresarial','resico'].includes(b.regimen);
 const {data:x,error}=await db.from('candidatos').insert({convocatoria:process.env.CONVOCATORIA,nombre:b.nombre,email:b.email.toLowerCase(),telefono:b.telefono,maestria:b.maestria,regimen:b.regimen,doctorado:b.doctorado=='si',estado:ok?'Pendiente de documentos':'Descartado en prefiltro'}).select().single();
 if(error)return R.json({error:error.code=='23505'?'Ya existe una postulación con este correo en esta convocatoria.':'No pudimos guardar tu registro.'},{status:400});
 if(!ok){await send(x.email,M.descarte());return R.json({msg:'Gracias por tu interés. Por el momento no cumples el perfil de la convocatoria. Te enviamos un correo con más detalle.'})}
 const url=`${process.env.APP_URL}/subir/${x.token}`;await send(x.email,M.docs(x,url));return R.json({url});}
