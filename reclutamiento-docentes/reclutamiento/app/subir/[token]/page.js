'use client';
import {useState} from 'react';
const D=[['cv','CV actualizado'],['constancia','Constancia de situación fiscal actualizada'],['titulo','Título de maestría'],['cedula','Cédula profesional de maestría']];
export default function P({params}){
 const [err,setErr]=useState(''),[ok,setOk]=useState(false);
 async function go(e){e.preventDefault();setErr('');const f=new FormData(e.target);f.set('token',params.token);
  const r=await fetch('/api/upload',{method:'POST',body:f}),j=await r.json();r.ok?setOk(true):setErr(j.error);}
 if(ok)return <><h1>Documentos recibidos</h1><p>La coordinación académica los revisará en un máximo de 3 días hábiles. Te avisaremos por correo.</p></>;
 return <><h1>Carga tus documentos</h1><p className="muted">Solo PDF. Entre los 4 archivos, máximo 4 MB en total. Los 4 son obligatorios.</p>
 <form onSubmit={go}>{D.map(([n,t])=><label key={n}>{t}<input type="file" name={n} accept="application/pdf" required/></label>)}
 {err&&<p className="err" role="alert">{err}</p>}<button>Enviar documentos</button></form></>}
