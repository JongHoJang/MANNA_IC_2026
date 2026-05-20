alter table public.lectures
  add column if not exists session_no int4;

alter table public.lectures
  drop constraint if exists lectures_session_no_check;

alter table public.lectures
  add constraint lectures_session_no_check
  check (session_no is null or session_no > 0);

update public.lectures
set
  session_no = case
    when day = 'Day1' and title ilike '%다시 교회로 오는 3040%' then 1
    when day = 'Day1' and title ilike '%소모임, 요즘 크리스천들이 교회에서 노는 이유%' then 2
    when day = 'Day1' and title ilike '%목회철학을 풀어내는 최고의 방법%' then 3
    when day = 'Day1' and title ilike '%따로 또 같이, 네트워크 교회%' then 4
    when day = 'Day1' and title ilike '%사모님 상담소%' then 5
    when day = 'Day1' and title ilike '%목회 브랜딩%' then 6
    when day = 'Day1' and title ilike '%커피챗 가능하신가요%' then 7
    when day = 'Day1' and title ilike '%나만의 목회철학%' then 8

    when day = 'Day2' and title ilike '%인스타로 목회하는 방법%' then 1
    when day = 'Day2' and title ilike '%AI 간사님과 함께 사역하기%' then 2
    when day = 'Day2' and title ilike '%신앙 놀이터%' then 3
    when day = 'Day2' and title ilike '%세살 신앙%' then 4
    when day = 'Day2' and title ilike '%상처 입은 청년부%' then 5
    when day = 'Day2' and title ilike '%시니어 사역%' then 6
    when day = 'Day2' and title ilike '%복지코디%' then 7
    when day = 'Day2' and title ilike '%평신도가 말하는 세상에 없던 평신도 사역%' then 8
    when day = 'Day2' and title ilike '%커피챗 가능하신가요%' then 9
    when day = 'Day2' and title ilike '%다음시대의 사역%' then 10

    when day = 'Day3' and title ilike '%변화산새벽기도회%' then 1
    when day = 'Day3' and title ilike '%AI 예배 활용법%' then 2
    when day = 'Day3' and title ilike '%찬양 인도%' then 3
    when day = 'Day3' and title ilike '%설교 스피치%' then 4
    when day = 'Day3' and title ilike '%예배 음악의 타락%' then 5
    when day = 'Day3' and title ilike '%탈고%' then 6
    when day = 'Day3' and title ilike '%코디도 예배다%' then 7
    when day = 'Day3' and title ilike '%음향 실전 워크숍%' then 8
    when day = 'Day3' and title ilike '%영상 제작 실전 워크숍%' then 9
    when day = 'Day3' and title ilike '%커피챗 가능하신가요%' then 10
    when day = 'Day3' and title ilike '%예배의 중심을 그리는 시간%' then 11
    else session_no
  end,
  title = case
    when day = 'Day1' and title ilike '%다시 교회로 오는 3040%' then '다시 교회로 오는 3040'
    when day = 'Day1' and title ilike '%소모임, 요즘 크리스천들이 교회에서 노는 이유%' then '소모임, 요즘 크리스천들이 교회에서 노는 이유'
    when day = 'Day1' and title ilike '%목회철학을 풀어내는 최고의 방법%' then '목회철학을 풀어내는 최고의 방법, 의외로 행정과 재무입니다'
    when day = 'Day1' and title ilike '%따로 또 같이, 네트워크 교회%' then '따로 또 같이, 네트워크 교회'
    when day = 'Day1' and title ilike '%사모님 상담소%' then '※목사님 출입금지※ 사모님 상담소'
    when day = 'Day1' and title ilike '%목회 브랜딩%' then '만나IC 총괄 기획자가 말하는 목회 브랜딩의 시작'
    when day = 'Day1' and title ilike '%커피챗 가능하신가요%' then '김병삼 목사님, 커피챗 가능하신가요?'
    when day = 'Day1' and title ilike '%나만의 목회철학%' then '나만의 목회철학을 그리는 시간'

    when day = 'Day2' and title ilike '%인스타로 목회하는 방법%' then '인스타로 목회하는 방법'
    when day = 'Day2' and title ilike '%AI 간사님과 함께 사역하기%' then 'AI 간사님과 함께 사역하기'
    when day = 'Day2' and title ilike '%신앙 놀이터%' then '교회학교 부장님들이 알려주는 ''신앙 놀이터'' 설계법'
    when day = 'Day2' and title ilike '%세살 신앙%' then '세살 신앙 여든간다! 가정과 아이가 함께 자라는 유치원, 사무엘 학교'
    when day = 'Day2' and title ilike '%상처 입은 청년부%' then '상처 입은 청년부, 다시 공동체를 세울 수 있는가? : 불안과 고립의 시대, 청년사역의 본질과 회복'
    when day = 'Day2' and title ilike '%시니어 사역%' then '교회의 미래를 결정하는 시니어 사역'
    when day = 'Day2' and title ilike '%복지코디%' then '복지 사각지대를 비추는 나눔사역, 복지코디'
    when day = 'Day2' and title ilike '%평신도가 말하는 세상에 없던 평신도 사역%' then '평신도가 말하는 세상에 없던 평신도 사역'
    when day = 'Day2' and title ilike '%커피챗 가능하신가요%' then '김병삼 목사님, 커피챗 가능하신가요?'
    when day = 'Day2' and title ilike '%다음시대의 사역%' then '다음시대의 사역을 그리는 시간'

    when day = 'Day3' and title ilike '%변화산새벽기도회%' then '변화산새벽기도회 기획노트 A~Z 전격공개'
    when day = 'Day3' and title ilike '%AI 예배 활용법%' then '와, 정말 핵심을 찔렀어! AI 예배 활용법'
    when day = 'Day3' and title ilike '%찬양 인도%' then '찬양 인도, 이것만 알면 쉬워진다'
    when day = 'Day3' and title ilike '%설교 스피치%' then '귀에 꽂히는 설교 스피치'
    when day = 'Day3' and title ilike '%예배 음악의 타락%' then '교회 안에 스며든 예배 음악의 타락'
    when day = 'Day3' and title ilike '%탈고%' then '한 끗 차이로 달라지는 설교, 탈고가 만듭니다.'
    when day = 'Day3' and title ilike '%코디도 예배다%' then '거울 앞에서 준비하는 예배, 코디도 예배다'
    when day = 'Day3' and title ilike '%음향 실전 워크숍%' then '장비 없어도 할 수 있는 교회 음향 실전 워크숍'
    when day = 'Day3' and title ilike '%영상 제작 실전 워크숍%' then '24년차 영상 간사님이 알려주는 영상 제작 실전 워크숍'
    when day = 'Day3' and title ilike '%커피챗 가능하신가요%' then '김병삼 목사님, 커피챗 가능하신가요?'
    when day = 'Day3' and title ilike '%예배의 중심을 그리는 시간%' then '예배의 중심을 그리는 시간'
    else title
  end,
  speaker = case
    when day = 'Day1' and title ilike '%다시 교회로 오는 3040%' then '김영선 목사'
    when day = 'Day1' and title ilike '%소모임, 요즘 크리스천들이 교회에서 노는 이유%' then '차우병 목사'
    when day = 'Day1' and title ilike '%목회철학을 풀어내는 최고의 방법%' then '박승국 목사 / 김호태 장로'
    when day = 'Day1' and title ilike '%따로 또 같이, 네트워크 교회%' then '김종윤(이천만나), 박성욱(남양주만나), 엄태호(창원만나), 정모세(영종만나), 최호균(용인만나)'
    when day = 'Day1' and title ilike '%사모님 상담소%' then '최인숙 사모 & 김정화 사모'
    when day = 'Day1' and title ilike '%목회 브랜딩%' then '김유나 집사'
    when day = 'Day1' and title ilike '%커피챗 가능하신가요%' then '김병삼 목사 & 신학생'
    when day = 'Day1' and title ilike '%나만의 목회철학%' then '참석자 3~4인씩 소그룹'

    when day = 'Day2' and title ilike '%인스타로 목회하는 방법%' then '김성경 목사'
    when day = 'Day2' and title ilike '%AI 간사님과 함께 사역하기%' then '박의성 목사'
    when day = 'Day2' and title ilike '%신앙 놀이터%' then '전준표 목사 / 교회학교 부장선생님들'
    when day = 'Day2' and title ilike '%세살 신앙%' then '문지희 목사'
    when day = 'Day2' and title ilike '%상처 입은 청년부%' then '이종현 목사'
    when day = 'Day2' and title ilike '%시니어 사역%' then '임병천 목사'
    when day = 'Day2' and title ilike '%복지코디%' then '이용주 목사'
    when day = 'Day2' and title ilike '%평신도가 말하는 세상에 없던 평신도 사역%' then '이상한 장로 / 진오민 권사'
    when day = 'Day2' and title ilike '%커피챗 가능하신가요%' then '김병삼 목사 & 신학생'
    when day = 'Day2' and title ilike '%다음시대의 사역%' then '참석자 3~4인씩 소그룹'

    when day = 'Day3' and title ilike '%변화산새벽기도회%' then '이현규 목사'
    when day = 'Day3' and title ilike '%AI 예배 활용법%' then '김이삭 목사'
    when day = 'Day3' and title ilike '%찬양 인도%' then '나요한 목사'
    when day = 'Day3' and title ilike '%설교 스피치%' then '김진 기자'
    when day = 'Day3' and title ilike '%예배 음악의 타락%' then '유은성 전도사'
    when day = 'Day3' and title ilike '%탈고%' then '오예송 전도사'
    when day = 'Day3' and title ilike '%코디도 예배다%' then '김진영 권사'
    when day = 'Day3' and title ilike '%음향 실전 워크숍%' then '원영진 간사'
    when day = 'Day3' and title ilike '%영상 제작 실전 워크숍%' then '석은충 간사'
    when day = 'Day3' and title ilike '%커피챗 가능하신가요%' then '김병삼 목사 & 신학생'
    when day = 'Day3' and title ilike '%예배의 중심을 그리는 시간%' then '참석자 3~4인씩 소그룹'
    else speaker
  end,
  position = case
    when day = 'Day1' and title ilike '%다시 교회로 오는 3040%' then '목양 팀장'
    when day = 'Day1' and title ilike '%소모임, 요즘 크리스천들이 교회에서 노는 이유%' then '소모임 담당'
    when day = 'Day1' and title ilike '%목회철학을 풀어내는 최고의 방법%' then '행정 담당 / 재무 담당'
    when day = 'Day1' and title ilike '%따로 또 같이, 네트워크 교회%' then '네트워크 교회'
    when day = 'Day1' and title ilike '%사모님 상담소%' then '사모님 상담'
    when day = 'Day1' and title ilike '%목회 브랜딩%' then '브랜디렉터'
    when day = 'Day1' and title ilike '%커피챗 가능하신가요%' then '신학생 한정'
    when day = 'Day1' and title ilike '%나만의 목회철학%' then '소그룹 워크숍'

    when day = 'Day2' and title ilike '%인스타로 목회하는 방법%' then '커뮤니티 오브 니어'
    when day = 'Day2' and title ilike '%AI 간사님과 함께 사역하기%' then '교구행정 담당'
    when day = 'Day2' and title ilike '%신앙 놀이터%' then '교회학교 총괄 / '
    when day = 'Day2' and title ilike '%세살 신앙%' then '사무엘학교 교육'
    when day = 'Day2' and title ilike '%상처 입은 청년부%' then '청년부 팀장'
    when day = 'Day2' and title ilike '%시니어 사역%' then '시니어 사역 담당'
    when day = 'Day2' and title ilike '%복지코디%' then '섬김국장'
    when day = 'Day2' and title ilike '%평신도가 말하는 세상에 없던 평신도 사역%' then 'BM 부장 / SOOM 위원'
    when day = 'Day2' and title ilike '%커피챗 가능하신가요%' then '신학생 한정'
    when day = 'Day2' and title ilike '%다음시대의 사역%' then '소그룹 워크숍'

    when day = 'Day3' and title ilike '%변화산새벽기도회%' then '예배기획 팀장'
    when day = 'Day3' and title ilike '%AI 예배 활용법%' then '미디어 팀장'
    when day = 'Day3' and title ilike '%찬양 인도%' then '음악부 팀장'
    when day = 'Day3' and title ilike '%설교 스피치%' then '채널A 동아일보 기자'
    when day = 'Day3' and title ilike '%예배 음악의 타락%' then '찬양사역자'
    when day = 'Day3' and title ilike '%탈고%' then '출판/묵상 담당'
    when day = 'Day3' and title ilike '%코디도 예배다%' then '전 협성대 미술대학 교수'
    when day = 'Day3' and title ilike '%음향 실전 워크숍%' then '음향 간사'
    when day = 'Day3' and title ilike '%영상 제작 실전 워크숍%' then '영상 간사'
    when day = 'Day3' and title ilike '%커피챗 가능하신가요%' then '신학생 한정'
    when day = 'Day3' and title ilike '%예배의 중심을 그리는 시간%' then '소그룹 워크숍'
    else position
  end;
