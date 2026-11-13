import {NextResponse as R} from 'next/server';
import {db} from '@/lib/db';import {slots} from '@/lib/google';
export const dynamic='force-dynamic';
export async function GET(r){
 const {data:c}=await db.from('candidatos').select('estado').eq('token',new URL(r.url).searchParams.get('token')).single();
 if(c?.estado!='Validado')return R.json({error:'Este enlace no está disponible.'},{status:400});
 return R.json({slots:await slots()});}
