-- 1) Admin flag
update public.participants
set is_admin = true
where name = '운영자';

-- 2) Lecture dates
update public.lectures set date = '2026-06-23' where day = 'Day1';
update public.lectures set date = '2026-06-24' where day = 'Day2';
update public.lectures set date = '2026-06-25' where day = 'Day3';

-- 3) Timetable rows
delete from public.timetable_rows;

insert into public.timetable_rows (day, sort_order, time, label, title, speaker, position, place, is_break) values
  ('Day1', 1, '09:00 - 10:00', '접수', 'QR코드 준비', null, null, '1층 안내데스크', false),
  ('Day1', 2, '10:00 - 11:00', '메인세션1', '다시, 목회철학', '김병삼', '담임 목사', '2층 시온성전', false),
  ('Day1', 3, '11:10 - 12:00', '메인세션2', '건축가 유현준이 그리는 공간', '유현준', '교수', '2층 시온성전', false),
  ('Day1', 4, '12:00 - 12:30', '메인세션', 'Q&A', null, null, '교회 식당, 주변 식당', false),
  ('Day1', 5, '12:30 - 14:30', '점심 시간', '(2시간)', null, null, '교회 식당, 주변 식당', true),
  ('Day1', 6, '14:30 - 15:25', '메인세션3', '데이터로 보는 교회의 부흥과 생존', '이현규, 김영선, 이종현, 차우병, 전준표', '목사', '2층 시온성전', false),
  ('Day1', 7, '15:25 - 15:55', '메인세션', 'Q&A', null, null, '2층 시온성전', false),
  ('Day1', 8, '15:55 - 16:20', '간식 및 이동 시간', '(25분)', null, null, '2층 로비', true),
  ('Day1', 9, '16:20 - 17:10', '선택세션1', '참가신청 시 선택한 세션', null, null, '각 선택세션 장소', false),
  ('Day1', 10, '17:10 - 17:30', '이동', '선택세션 장소로 이동', null, null, '각 선택세션 장소', false),
  ('Day1', 11, '17:30 - 18:20', '선택세션2', '참가신청 시 선택한 세션', null, null, '각 선택세션 장소', false),
  ('Day1', 12, '18:20 - 20:00', '저녁 시간', '(1시간 40분)', null, null, '교회 식당, 주변 식당', true),
  ('Day1', 13, '20:00 - 21:30', 'DAY.1', '변화산 저녁기도회', null, null, '2층 시온성전', false),

  ('Day2', 1, '12:30 - 13:30', '접수', 'QR코드 준비', null, null, '1층 안내데스크', false),
  ('Day2', 2, '13:40 - 14:30', '메인세션1', '이제, 다음시대', '김병삼', '담임 목사', '2층 시온성전', false),
  ('Day2', 3, '14:35 - 15:25', '메인세션2', '성도의 생애주기를 업데이트하다', '김영선, 이종현', '목사', '2층 시온성전', false),
  ('Day2', 4, '15:25 - 15:55', '메인세션', 'Q&A', null, null, '2층 시온성전', false),
  ('Day2', 5, '15:55 - 16:20', '간식 및 이동 시간', '(35분)', null, null, '2층 로비', true),
  ('Day2', 6, '16:20 - 17:10', '첫번째 선택세션', '(50분)', null, null, '각 선택세션 장소', false),
  ('Day2', 7, '17:10 - 17:30', '이동', '선택세션 장소로 이동', null, null, '각 선택세션 장소', false),
  ('Day2', 8, '17:30 - 18:20', '두번째 선택세션', '(40분)', null, null, '각 선택세션 장소', false),
  ('Day2', 9, '18:20 - 20:00', '저녁 시간', '(1시간 40분)', null, null, '교회 식당, 주변 식당', true),
  ('Day2', 10, '20:00 - 21:30', 'DAY.2', '변화산 저녁기도회', null, null, '2층 시온성전', false),

  ('Day3', 1, '09:00 - 10:00', '접수', 'QR코드 준비', null, null, '1층 안내데스크', false),
  ('Day3', 2, '10:00 - 11:00', '메인세션1', '결국, 예배', '김병삼', '담임목사', '2층 시온성전', false),
  ('Day3', 3, '11:00 - 12:00', '메인세션2', E'예배와 기획 : \n 만나교회 예배는 기획에서 출발합니다', '이현규, 김이삭', '목사', '2층 시온성전', false),
  ('Day3', 4, '12:00 - 14:00', '점심 시간', '(2시간)', null, null, '교회 식당, 주변 식당', true),
  ('Day3', 5, '14:00 - 14:50', '메인세션3', E'예배와 음악 : \n 음악은 어떻게 예배의 언어가 되는가', '나요한', '목사', '2층 시온성전', false),
  ('Day3', 6, '14:50 - 15:30', '메인세션', 'Q&A', null, null, '2층 시온성전', false),
  ('Day3', 7, '15:30 - 16:00', '간식 및 이동 시간', '(30분)', null, null, '2층 로비', true),
  ('Day3', 8, '16:00 - 16:50', '첫번째 선택세션', '(50분)', null, null, '각 선택세션 장소', false),
  ('Day3', 9, '16:50 - 17:20', '이동', '선택세션 장소로 이동', null, null, '각 선택세션 장소', false),
  ('Day3', 10, '17:20 - 18:10', '두번째 선택세션', '(50분)', null, null, '각 선택세션 장소', false),
  ('Day3', 11, '18:10 - 20:00', '저녁 시간', '(1시간 50분)', null, null, '교회 식당, 주변 식당', true),
  ('Day3', 12, '20:00 - 21:30', 'DAY.3', '변화산 저녁기도회', null, null, '2층 시온성전', false);

-- 4) Optional next step for lectures.slot_order
-- Leave this for later unless you can confirm which lectures belong to slot 1 vs slot 2.
