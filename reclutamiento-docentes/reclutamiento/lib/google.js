import {google} from 'googleapis';
import {Readable} from 'stream';
const auth=s=>new google.auth.JWT({email:process.env.GOOGLE_CLIENT_EMAIL,key:process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,'\n'),subject:s,
 scopes:['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/calendar']});
const drive=()=>google.drive({version:'v3',auth:auth(process.env.INTERVIEWER_EMAIL)});
const cal=()=>google.calendar({version:'v3',auth:auth(process.env.INTERVIEWER_EMAIL)});
export async function carpeta(c){
 const d=drive();
 const {data}=await d.files.create({requestBody:{name:`${c.nombre} · ${c.maestria}`,mimeType:'application/vnd.google-apps.folder',parents:[process.env.DRIVE_FOLDER_ID]},fields:'id',supportsAllDrives:true});
 for(const e of (process.env.DIRECTORS_EMAILS||'').split(',').filter(Boolean))
  await d.permissions.create({fileId:data.id,requestBody:{role:'reader',type:'user',emailAddress:e.trim()},sendNotificationEmail:false,supportsAllDrives:true});
 return data.id;}
export const subir=(folder,name,buf)=>drive().files.create({requestBody:{name,parents:[folder]},media:{mimeType:'application/pdf',body:Readable.from(buf)},supportsAllDrives:true});
export async function slots(){
 const out=[],now=Date.now();
 for(let d=1;d<=14;d++){
  const day=new Date(now-6*36e5+d*864e5).toISOString().slice(0,10),wd=new Date(day+'T12:00:00Z').getUTCDay();
  if(wd==0||wd==6)continue;
  for(let m=540;m+45<=960;m+=45)out.push(new Date(`${day}T${String(m/60|0).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:00-06:00`));}
 const {data}=await cal().freebusy.query({requestBody:{timeMin:out[0].toISOString(),timeMax:new Date(out.at(-1).getTime()+27e5).toISOString(),items:[{id:'primary'}]}});
 const busy=data.calendars.primary.busy;
 return out.filter(s=>!busy.some(b=>s<new Date(b.end)&&new Date(s.getTime()+27e5)>new Date(b.start))).map(s=>s.toISOString());}
export async function agendar(c,start){
 const end=new Date(new Date(start).getTime()+27e5).toISOString();
 const {data}=await cal().events.insert({calendarId:'primary',conferenceDataVersion:1,sendUpdates:'all',requestBody:{summary:`Entrevista docente · ${c.maestria}`,start:{dateTime:start},end:{dateTime:end},attendees:[{email:c.email}],conferenceData:{createRequest:{requestId:c.id,conferenceSolutionKey:{type:'hangoutsMeet'}}}}});
 return data.hangoutLink;}
