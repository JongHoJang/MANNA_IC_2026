alter table public.participants
  add column if not exists email text,
  add column if not exists organization text;
