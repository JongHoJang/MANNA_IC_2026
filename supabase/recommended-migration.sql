-- Recommended minimal changes for the current app
-- Goal: keep existing participants / lectures / registrations tables,
-- and add only the metadata needed to remove remaining mock timetable data.

-- 1) lectures: add date + slot_order so lecture metadata is self-contained.
alter table public.lectures
  add column if not exists date text,
  add column if not exists slot_order int4;

-- Optional but recommended defaults/checks.
alter table public.lectures
  add constraint lectures_slot_order_check
  check (slot_order is null or slot_order in (1, 2));

-- 2) timetable_rows: add one table for full schedule rows.
create table if not exists public.timetable_rows (
  id uuid primary key default gen_random_uuid(),
  day text not null check (day in ('Day1', 'Day2', 'Day3')),
  sort_order int4 not null,
  time text not null,
  label text not null,
  title text not null,
  speaker text,
  position text,
  place text not null,
  is_break boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.timetable_rows
  add column if not exists speaker text,
  add column if not exists position text;

create unique index if not exists timetable_rows_day_sort_order_idx
  on public.timetable_rows (day, sort_order);

-- 3) Optional admin flag on participants.
-- If you don't want to keep using `position like '%admin%'`, add this.
alter table public.participants
  add column if not exists is_admin boolean not null default false;

-- 4) Example updates for lectures.
-- Replace these with your actual row ids if you already have lecture data synced.
-- update public.lectures set date = '2026-06-23', slot_order = 1 where day = 'Day1' and title like '선택세션1.%';
-- update public.lectures set date = '2026-06-23', slot_order = 2 where day = 'Day1' and title like '선택세션9.%';

-- 5) Example timetable row inserts.
-- Insert all rows needed by the app, one row per visible schedule line.
-- Example:
-- insert into public.timetable_rows (day, sort_order, time, label, title, speaker, position, place, is_break)
-- values
--   ('Day1', 1, '09:00 - 10:00', '접수', 'QR코드 준비', null, null, '1층 안내데스크', false),
--   ('Day1', 2, '10:00 - 11:00', '메인세션1', '다시, 목회철학', '김병삼', '담임 목사', '2층 시온성전', false);
