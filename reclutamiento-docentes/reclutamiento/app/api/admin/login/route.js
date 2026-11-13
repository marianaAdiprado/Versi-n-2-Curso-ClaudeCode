import {NextResponse as R} from 'next/server';import {token} from '@/lib/auth';
export async function POST(r){
 const f=await r.formData(),res=R.redirect(new URL('/admin',r.url),303);
 if(f.get('p')===process.env.ADMIN_PASSWORD)res.cookies.set('adm',token(),{httpOnly:true,secure:true,path:'/',maxAge:28800});return res;}
