update public.lectures
set slot_order = 1
where title ilike '%김병삼 목사님, 커피챗 가능하신가요%';

create or replace function public.apply_lecture_selection(
  p_participant_id text,
  p_day text,
  p_slot_order int4,
  p_lecture_id text
)
returns table (
  success boolean,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.participants%rowtype;
  v_lecture public.lectures%rowtype;
  v_existing public.registrations%rowtype;
  v_duplicate public.registrations%rowtype;
  v_application_count int4;
  v_normalized_title text;
  v_normalized_position text;
  v_participant_uuid uuid;
  v_lecture_uuid uuid;
begin
  v_participant_uuid := p_participant_id::uuid;
  v_lecture_uuid := p_lecture_id::uuid;

  select *
  into v_participant
  from public.participants
  where id = v_participant_uuid;

  if not found then
    return query select false, '신청 대상 정보를 찾을 수 없습니다.';
    return;
  end if;

  select *
  into v_lecture
  from public.lectures
  where id = v_lecture_uuid
  for update;

  if not found then
    return query select false, '신청 대상 정보를 찾을 수 없습니다.';
    return;
  end if;

  if v_lecture.day <> p_day then
    return query select false, '선택한 날짜와 세션 날짜가 일치하지 않습니다.';
    return;
  end if;

  v_normalized_title := regexp_replace(coalesce(v_lecture.title, ''), '\s+', '', 'g');
  v_normalized_position := regexp_replace(coalesce(v_participant.position, ''), '\s+', '', 'g');

  if position('커피챗' in v_normalized_title) > 0 and p_slot_order <> 1 then
    return query select false, '이 세션은 첫번째 선택세션에서만 선택할 수 있습니다.';
    return;
  end if;

  if position('목사님출입금지' in v_normalized_title) > 0 and v_normalized_position <> '사모' then
    return query select false, '사모만 신청할 수 있는 세션입니다.';
    return;
  end if;

  if position('커피챗' in v_normalized_title) > 0 and v_normalized_position <> '신학생' then
    return query select false, '신학생만 신청할 수 있는 세션입니다.';
    return;
  end if;

  select *
  into v_duplicate
  from public.registrations
  where participant_id = v_participant_uuid
    and day = p_day
    and lecture_id = v_lecture_uuid
    and slot_order <> p_slot_order
  limit 1;

  if found then
    return query select false, '같은 세션을 다른 슬롯에 중복으로 선택할 수 없습니다.';
    return;
  end if;

  select *
  into v_existing
  from public.registrations
  where participant_id = v_participant_uuid
    and day = p_day
    and slot_order = p_slot_order
  limit 1;

  if v_existing.lecture_id is distinct from p_lecture_id and coalesce(v_lecture.capacity, 0) > 0 then
    select count(*)
    into v_application_count
    from public.registrations
    where lecture_id = v_lecture_uuid
      and not (
        participant_id = v_participant_uuid
        and day = p_day
        and slot_order = p_slot_order
      );

    if v_application_count >= v_lecture.capacity then
      return query select false, '정원이 모두 찬 세션입니다. 다른 세션을 선택해 주세요.';
      return;
    end if;
  end if;

  insert into public.registrations (
    id,
    participant_id,
    day,
    slot_order,
    lecture_id
  )
  values (
    coalesce(v_existing.id, gen_random_uuid()),
    v_participant_uuid,
    p_day,
    p_slot_order,
    v_lecture_uuid
  )
  on conflict (participant_id, day, slot_order)
  do update set lecture_id = excluded.lecture_id;

  return query select true, format('%s %s 선택이 반영되었습니다.', p_day, case when p_slot_order = 1 then '1타임' else '2타임' end);
end;
$$;

grant execute on function public.apply_lecture_selection(text, text, int4, text) to anon, authenticated, service_role;
