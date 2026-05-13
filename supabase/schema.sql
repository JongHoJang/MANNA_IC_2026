create table if not exists public.participants (
  id text primary key,
  name text not null,
  phone text not null,
  ticket_text text not null,
  position text not null
);

create table if not exists public.lectures (
  id text primary key,
  day text not null check (day in ('Day1', 'Day2', 'Day3')),
  date text not null,
  title text not null,
  speaker text not null,
  location text not null
);

create table if not exists public.applications (
  id text primary key,
  participant_id text not null references public.participants(id) on delete cascade,
  day text not null check (day in ('Day1', 'Day2', 'Day3')),
  time_slot text not null check (time_slot in ('1타임', '2타임')),
  lecture_id text not null references public.lectures(id) on delete cascade,
  unique (participant_id, day, time_slot)
);

create table if not exists public.timetable_days (
  id text primary key,
  day text not null unique check (day in ('Day1', 'Day2', 'Day3')),
  title text not null,
  date text not null,
  sort_order int not null
);

create table if not exists public.timetable_rows (
  id text primary key,
  timetable_day_id text not null references public.timetable_days(id) on delete cascade,
  time text not null,
  label text not null,
  title text not null,
  place text not null,
  sort_order int not null
);
