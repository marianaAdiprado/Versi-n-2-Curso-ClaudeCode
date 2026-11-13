import nodemailer from 'nodemailer';
const t=nodemailer.createTransport({host:process.env.SMTP_HOST,port:465,secure:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
export const send=(to,[subject,text])=>t.sendMail({from:process.env.MAIL_FROM,to,subject,text});
export const fecha=d=>new Date(d).toLocaleString('es-MX',{timeZone:'America/Mexico_City',dateStyle:'full',timeStyle:'short'});
const F='\n\nCoordinación de Producto Académico\nUdelPrado';
export const M={
 descarte:()=>['Tu postulación docente','Gracias por tu interés en UdelPrado. Por el momento no cumples el perfil de la convocatoria. Conservaremos tus datos para futuras oportunidades.'+F],
 docs:(c,u)=>['Carga tus documentos',`Hola ${c.nombre}, gracias por postularte. Carga tus documentos aquí: ${u}`+F],
 recibido:c=>['Recibimos tus documentos',`Hola ${c.nombre}, recibimos tus documentos. La coordinación académica los revisará en un máximo de 3 días hábiles.`+F],
 correccion:(c,u,v)=>['Corrige tus documentos',`Hola ${c.nombre}, necesitamos que corrijas tus documentos: ${v}\nVuelve a cargarlos aquí: ${u}`+F],
 validado:(c,u)=>['Cumples los requisitos: agenda tu entrevista',`Hola ${c.nombre}, confirmamos que cumples los requisitos. Elige fecha para tu entrevista con la Coordinación de Producto Académico: ${u}`+F],
 agendada:(c,l,s)=>['Entrevista confirmada',`Hola ${c.nombre}, tu entrevista es el ${fecha(s)} (hora CDMX).\nEnlace de Meet: ${l}`+F],
 pausa:c=>['Resultado de tu postulación',`Hola ${c.nombre}, gracias por tu tiempo. Por ahora tu perfil queda en banco de reserva y te contactaremos si surge una oportunidad.`+F],
 rechazo:c=>['Resultado de tu postulación',`Hola ${c.nombre}, gracias por tu tiempo y tu interés. En esta ocasión no continuaremos con tu postulación.`+F],
 contrato:c=>['Enviar contrato',`${c.nombre} (${c.email}) fue seleccionado/a para ${c.maestria}. Envíale el contrato.`]};
