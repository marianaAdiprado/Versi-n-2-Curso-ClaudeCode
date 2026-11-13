import {NextResponse as R} from 'next/server';
import {db} from '@/lib/db';import {carpeta,subir} from '@/lib/google';import {send,M} from '@/lib/mail';
export async function POST(r){
 const f=await r.formData();
 const {data:c}=await db.from('candidatos').select('*').eq('token',f.get('token')).single();
 if(!c||!['Pendiente de documentos','Corrección solicitada'].includes(c.estado))return R.json({error:'Este enlace ya no está disponible.'},{status:400});
 const names=['cv','constancia','titulo','cedula'],files=names.map(n=>f.get(n));
 if(files.some(x=>!x||!x.size||x.type!='application/pdf'))return R.json({error:'Faltan documentos o alguno no es PDF.'},{status:400});
 if(files.reduce((a,x)=>a+x.size,0)>4e6)return R.json({error:'Los archivos pesan más de 4 MB en total.'},{status:400});
 const folder=c.drive_folder||await carpeta(c),s=new Date().toISOString().slice(0,10);
 for(const [i,n] of names.entries())await subir(folder,`${n}_${s}.pdf`,Buffer.from(await files[i].arrayBuffer()));
 await db.from('candidatos').update({drive_folder:folder,estado:'Documentos en revisión'}).eq('id',c.id);
 await send(c.email,M.recibido(c));return R.json({ok:true});}
