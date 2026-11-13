'use client';
import {useState,useEffect} from 'react';
const fmt=s=>new Date(s).toLocaleString('es-MX',{timeZone:'America/Mexico_City',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
export default function P({params}){
 const [s,setS]=useState(null),[err,setErr]=useState(''),[ok,setOk]=useState('');
 useEffect(()=>{fetch('/api/slots?token='+params.token).then(r=>r.json()).then(j=>j.error?setErr(j.error):setS(j.slots))},[]);
 async function book(start){const r=await fetch('/api/book',{method:'POST',body:JSON.stringify({token:params.token,start})}),j=await r.json();r.ok?setOk(j.meet):setErr(j.error)}
 if(ok)return <><h1>Entrevista confirmada</h1><p>Te enviamos la invitación por correo. Enlace de Meet: <a href={ok}>{ok}</a></p></>;
 return <><h1>Agenda tu entrevista</h1><p className="muted">Horarios en hora de Ciudad de México. Duración: 45 minutos.</p>
 {err&&<p className="err" role="alert">{err}</p>}{!s&&!err&&<p>Cargando horarios…</p>}
 <div className="slots">{s?.map(x=><button key={x} onClick={()=>book(x)}>{fmt(x)}</button>)}</div></>}
