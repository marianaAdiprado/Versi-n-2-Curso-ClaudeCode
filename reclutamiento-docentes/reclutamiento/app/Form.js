'use client';
import {useState} from 'react';
const YN=({n,t})=><label>{t}<select name={n} required><option value="">Elige</option><option value="si">Sí</option><option value="no">No</option></select></label>;
export default function Form({maestrias}){
 const [msg,setMsg]=useState(''),[err,setErr]=useState('');
 async function go(e){e.preventDefault();setErr('');
  const r=await fetch('/api/register',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))}),j=await r.json();
  if(!r.ok)return setErr(j.error);j.url?location.href=j.url:setMsg(j.msg);}
 if(msg)return <p>{msg}</p>;
 return <form onSubmit={go}>
  <label>Nombre completo<input name="nombre" required/></label>
  <label>Correo electrónico<input name="email" type="email" required/></label>
  <label>Teléfono<input name="telefono" type="tel" required/></label>
  <label>Maestría a la que te postulas<select name="maestria" required><option value="">Elige</option>{maestrias.map(m=><option key={m}>{m}</option>)}</select></label>
  <YN n="titulo" t="¿Cuentas con título y cédula de maestría?"/>
  <YN n="experiencia" t="¿Tienes experiencia docente en ambientes virtuales?"/>
  <YN n="cdmx" t="¿Resides en la Ciudad de México?"/>
  <label>Régimen fiscal actual<select name="regimen" required><option value="">Elige</option><option value="empresarial">Persona física con actividad empresarial</option><option value="resico">Régimen Simplificado de Confianza</option><option value="otro">Otro</option></select></label>
  <YN n="doctorado" t="¿Cuentas con doctorado? (deseable)"/>
  <label><span><input type="checkbox" name="privacidad" required/> Acepto el aviso de privacidad: UdelPrado protegerá mis datos y documentos y los usará solo para este proceso de selección.</span></label>
  {err&&<p className="err" role="alert">{err}</p>}<button>Enviar postulación</button></form>}
