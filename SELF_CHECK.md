# 자체 점검

## SPEC 기능 체크

- [x] 기능 1: `/admin` 경로와 기존 관리자 로그인 흐름을 유지한 채 참가자 운영 대시보드로 전환
- [x] 기능 2: 참가자 목록 테이블에 이름, 소속, 직분, 연락처, 이메일, 티켓, Day1~Day3 신청 상태 표시
- [x] 기능 3: 이름/연락처/이메일/소속 검색, 티켓 필터, 완료 여부 필터, 미신청 Day 필터 연결
- [x] 기능 4: 선택 참가자 상세 패널에서 일자별 신청 세션과 미신청 상태 확인
- [x] 기능 5: 참가자 기본 정보, 이메일, 소속, 티켓, 참가 일자 수정 후 즉시 반영
- [x] 기능 6: Day1~Day3별 신청 세션을 목록/상세에서 동일 의미로 노출
- [x] 기능 7: 미신청 대상 추적을 incomplete 필터와 미신청 Day 필터로 지원
- [x] 기능 8: 현재 필터 기준 미신청 대상 CSV 다운로드 API 및 버튼 연결
- [x] 기능 9: 세션별 신청 인원과 정원 현황 표시, `slot_order` 우선 사용 + fallback 유지
- [x] 기능 10: 상단 운영 요약 지표 제공
- [x] 기능 11: 저장 직후 목록/상세가 즉시 갱신되도록 클라이언트 상태 동기화

## 구현 메모

- `participants` 타입과 Supabase 스키마에 `email`, `organization` nullable 확장을 반영했다.
- mock 데이터와 Supabase 로더가 같은 shape를 사용하도록 리포지토리 매핑을 통일했다.
- admin API는 `GET /api/admin/participants`, `PATCH /api/admin/participants/[participantId]`, `GET /api/admin/export` 3개로 구성했다.
- 전체 빌드를 통과시키기 위해 기존 사용자 화면의 미사용 prop/import 두 건도 최소 수정했다.

## 검증

- [x] `npm run build`
