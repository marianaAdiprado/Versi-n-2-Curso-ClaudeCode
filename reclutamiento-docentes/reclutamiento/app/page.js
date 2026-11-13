import Form from './Form';
export const dynamic='force-dynamic';
export default function P(){
 const n=Date.now(),o=process.env.CONV_OPEN,c=process.env.CONV_CLOSE;
 const abierta=(!o||n>=+new Date(o))&&(!c||n<=+new Date(c));
 return <><h1>Convocatoria para docentes de maestría</h1>
 {abierta?<><p>Buscamos docentes con grado de maestría para impartir clases en línea. Solo puedes postularte a una maestría.</p>
 <Form maestrias={(process.env.NEXT_PUBLIC_MAESTRIAS||'').split(',')}/></>:<p>La convocatoria no está abierta en este momento.</p>}</>}
