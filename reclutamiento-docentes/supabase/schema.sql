create extension if not exists pgcrypto;
create table candidates (
  id uuid primary key default gen_random_uuid(),
  token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  nombre text not null, correo text not null, telefono text, maestria text not null,
  titulo_maestria boolean, exp_virtual boolean, reside_cdmx boolean, regimen text, doctorado boolean,
  status text not null default 'docs_pendientes',
  motivo text, slot timestamptz unique, meet_link text, notas text,
  estado_propuesto text, estado_final text
);
create unique index candidates_correo_uq on candidates (lower(correo));
alter table candidates enable row level security; -- sin políticas: solo accede el backend con service key
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos','documentos',false,10485760,array['application/pdf']) on conflict do nothing;
