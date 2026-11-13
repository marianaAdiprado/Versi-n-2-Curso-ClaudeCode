create table candidatos(
 id uuid primary key default gen_random_uuid(),
 token uuid not null default gen_random_uuid() unique,
 convocatoria text not null, nombre text, email text, telefono text,
 maestria text, regimen text, doctorado boolean default false,
 estado text not null, propuesto text, nota text, drive_folder text,
 entrevista_inicio timestamptz, meet_link text,
 created_at timestamptz default now(),
 unique(email, convocatoria));
alter table candidatos enable row level security;
