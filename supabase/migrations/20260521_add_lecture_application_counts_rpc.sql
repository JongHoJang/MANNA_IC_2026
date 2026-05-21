create or replace function public.get_lecture_application_counts()
returns table (
  lecture_id text,
  count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    registration.lecture_id::text as lecture_id,
    count(*)::bigint as count
  from public.registrations as registration
  group by registration.lecture_id;
$$;

grant execute on function public.get_lecture_application_counts() to anon, authenticated, service_role;
