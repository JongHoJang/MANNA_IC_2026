create table if not exists public.participants (
  id text primary key,
  name text not null,
  phone text not null,
  position text,
  ticket_info text,
  day1 boolean not null default false,
  day2 boolean not null default false,
  day3 boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lectures (
  id text primary key,
  day text not null check (day in ('Day1', 'Day2', 'Day3')),
  date date not null,
  title text not null,
  speaker text not null,
  position text,
  location text not null,
  capacity int4,
  slot_order int4 check (slot_order is null or slot_order in (1, 2)),
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id text primary key,
  participant_id text not null references public.participants(id) on delete cascade,
  day text not null check (day in ('Day1', 'Day2', 'Day3')),
  slot_order int4 not null check (slot_order in (1, 2)),
  lecture_id text not null references public.lectures(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (participant_id, day, slot_order)
);

create table if not exists public.timetable_rows (
  id uuid primary key default gen_random_uuid(),
  day text not null check (day in ('Day1', 'Day2', 'Day3')),
  sort_order int4 not null,
  time text not null,
  label text not null,
  title text not null,
  speaker text,
  position text,
  location text not null,
  is_break boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists timetable_rows_day_sort_order_idx
  on public.timetable_rows (day, sort_order);
