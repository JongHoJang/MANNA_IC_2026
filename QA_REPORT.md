# QA REPORT

## 이번 라운드 핵심 요약

- 이전 라운드에서 지적됐던 핵심 누락은 대부분 해소되었습니다. 참가자 기본 정보 수정 UI, `누락 Day` 필터, 미신청 추적 섹션, CSV 다운로드, 전체 등록 건수 KPI, 세션 날짜 필터가 현재 구현에 모두 반영되어 있습니다.
- `SPEC.md` 기준 핵심 운영 흐름은 전반적으로 충족됩니다. 운영자는 `/admin`에서 참가자 검색·필터링, 상세 조회·수정, 미신청자 추적·다운로드, 세션별 신청 현황 확인까지 한 화면 체계 안에서 수행할 수 있습니다.
- 다만 두 가지 잔여 리스크가 남아 있습니다. 첫째, 세션 선택 검증 실패가 발생해도 API가 실제 원인 대신 `참가자를 찾지 못했습니다`라는 404 메시지를 반환합니다. 둘째, `ticketInfo`는 전용 입력 없이 Day 토글로만 재구성되어 기존 자유 텍스트성 티켓 정보를 보존·수정하기 어렵습니다.

## 이전 피드백 반영 확인

- [개선] 참가자 기본 정보 수정 복구: 이름, 소속, 직분, 연락처, 이메일 입력이 다시 editable 상태이며 저장 액션에 연결되어 있습니다. 근거: `src/app/admin/_components/AdminParticipantDetailPanel.tsx:123-167`, `src/app/admin/_components/AdminDashboard.tsx:547-583`
- [개선] `누락 Day` 필터 복구: 필터 바에 Day1~Day3 누락 기준 토글이 실제 렌더링됩니다. 근거: `src/app/admin/_components/AdminDashboard.tsx:812-817`
- [개선] 미신청 추적 전용 뷰 추가: 현재 필터 결과와 연동된 별도 추적 섹션이 존재합니다. 근거: `src/app/admin/_components/AdminDashboard.tsx:820-859`
- [개선] 미신청자 다운로드 명세 정렬: 기본 다운로드가 CSV이며 `이름, 연락처, 이메일, 티켓 정보, 미신청 Day` 컬럼을 포함합니다. 근거: `src/app/api/admin/export/route.ts:139-160`
- [개선] KPI/세션 통계 보강: 상단에 전체 등록 건수가 추가됐고, 세션 통계에 날짜 필터가 생겼습니다. 근거: `src/app/admin/_components/AdminOverviewMetrics.tsx:33-46`, `src/app/admin/_components/AdminSessionStats.tsx:107-145`
- [퇴보 없음] 이전 라운드에서 통과로 보던 관리자 인증 보호는 현재도 유지됩니다. 근거: `src/app/api/admin/participants/route.ts:7-20`, `src/app/api/admin/export/route.ts:76-86`, `src/app/api/admin/export-sessions/route.ts:42-52`, `src/app/api/admin/logout/route.ts:11-27`

## SPEC 기능 검증

- [PASS] 기능 1: `/admin` 경로가 유지되며, 관리자 세션이 아니면 사용자 화면(`/`)으로 우회되고 관리자 로그인 시 `/admin`으로 진입합니다. 근거: `src/app/admin/page.tsx:17-21`, `src/app/page.tsx:71-75`, `src/app/page.tsx:194-196`
- [PASS] 기능 2: 참가자 목록에서 이름, 소속, 직분, 연락처, 이메일, 티켓 정보와 Day1~Day3 상태, 총 신청 수를 확인할 수 있고 모바일 카드 레이아웃도 별도로 제공됩니다. 근거: `src/app/admin/_components/AdminParticipantTable.tsx:146-188`, `src/app/admin/_components/AdminParticipantTable.tsx:194-273`
- [PASS] 기능 3: 이름/연락처 중심 검색, 티켓 필터, 누락 Day 필터, 완료 여부 필터가 구현되어 있고 관리자 계정은 서버 단계에서 제외됩니다. 근거: `src/app/admin/_components/AdminDashboard.tsx:431-466`, `src/app/admin/_components/AdminDashboard.tsx:796-817`, `src/lib/repositories/app-data.ts:832-839`
- [PASS] 기능 4: 참가자 상세 패널에서 기본 정보, Day1~Day3 참석 여부, 슬롯별 선택 강의와 강연자·장소를 확인할 수 있고, 비활성 Day는 오버레이로 강조됩니다. 근거: `src/app/admin/_components/AdminParticipantDetailPanel.tsx:120-170`, `src/app/admin/_components/AdminParticipantDetailPanel.tsx:202-285`
- [PARTIAL] 기능 5: 이름, 연락처, 직분, 이메일, 소속, Day1~Day3는 수정 가능하고 읽기 전용 메타 정보 구분도 맞습니다. 다만 `ticketInfo`는 전용 입력 없이 Day 토글로만 재구성되어 명시적 수정 필드 요구를 완전히 충족했다고 보기는 어렵습니다. 근거: `src/app/admin/_components/AdminParticipantDetailPanel.tsx:172-222`, `src/app/admin/_components/AdminDashboard.tsx:652-675`, `src/app/api/admin/participants/[participantId]/route.ts:26-58`
- [PASS] 기능 6: Day1~Day3, 각 2개 슬롯 기준 매트릭스 의미가 목록과 상세 패널 양쪽에서 일관되게 유지되고, 미신청 상태도 `-` 또는 `선택 안함`으로 드러납니다. 근거: `src/app/admin/_components/AdminParticipantTable.tsx:69-130`, `src/app/admin/_components/AdminParticipantDetailPanel.tsx:224-285`
- [PASS] 기능 7: 미신청자 수 요약과 누락 Day, 이름, 연락처, 이메일, 티켓 정보를 보여주는 별도 추적 섹션이 있고 현재 필터 상태와 연동됩니다. 근거: `src/app/admin/_components/AdminDashboard.tsx:467-468`, `src/app/admin/_components/AdminDashboard.tsx:820-859`
- [PASS] 기능 8: 현재 적용된 필터를 기준으로 미신청자 CSV를 다운로드하며, 대상이 없을 때는 파일 대신 안내 메시지를 반환합니다. 근거: `src/app/admin/_components/AdminDashboard.tsx:586-620`, `src/app/api/admin/export/route.ts:88-137`, `src/app/api/admin/export/route.ts:139-162`
- [PASS] 기능 9: 세션별로 강의명, 일자, 장소, 신청자 수, 정원 미설정 여부/정원 대비 수치를 보여주고 날짜 필터로 범위를 좁힐 수 있습니다. 근거: `src/app/admin/_components/AdminSessionStats.tsx:37-73`, `src/app/admin/_components/AdminSessionStats.tsx:86-173`
- [PASS] 기능 10: 상단 KPI에서 전체 참가자 수, 완료 수, 미완료 수, 전체 등록 건수, 완료 퍼센트를 즉시 확인할 수 있습니다. 근거: `src/app/admin/_components/AdminOverviewMetrics.tsx:19-47`
- [PASS] 기능 11: 저장 후 참가자 목록과 신청 데이터 상태를 즉시 갱신해 상세 패널, 목록, 통계 계산이 새로고침 없이 반영됩니다. 근거: `src/app/admin/_components/AdminDashboard.tsx:571-578`, `src/app/admin/_components/AdminDashboard.tsx:501-504`, `src/app/admin/_components/AdminDashboard.tsx:541-545`

## 주요 발견 사항

1. [중간] 세션 선택 검증 실패가 잘못된 오류 메시지로 노출됩니다. 위치: `src/lib/repositories/app-data.ts:901-907`, `src/app/api/admin/participants/[participantId]/route.ts:47-67`. 왜 문제인가: 세션 중복 선택, 정원 초과, 자격 미충족처럼 실제로는 "저장 실패"인 경우에도 저장 API는 `null`을 반환하고 라우트는 이를 `수정할 참가자를 찾지 못했습니다.`라는 404로 처리합니다. 운영자는 참가자 존재 문제로 오인하게 됩니다. 어떻게 고쳐야 하나: `updateAdminParticipant`가 검증 실패 원인을 구분된 결과 타입으로 반환하고, 라우트는 400 계열 상태와 실제 검증 메시지를 그대로 내려주어야 합니다.
2. [중간] `ticketInfo` 직접 수정 경로가 없습니다. 위치: `src/app/admin/_components/AdminParticipantDetailPanel.tsx:202-222`, `src/app/admin/_components/AdminDashboard.tsx:652-675`. 왜 문제인가: 현재 구현은 Day 토글을 변경할 때 `ticketInfo`를 `Day1 Day2 Day3` 문자열로 재조합합니다. 기존 스키마의 `ticket_info`가 날짜 외 추가 맥락을 담는 경우 값을 보존하거나 직접 정정할 수 없습니다. 어떻게 고쳐야 하나: Day 토글과 별도로 `ticketInfo` 입력 필드를 두거나, 최소한 현재 표시되는 티켓 문자열을 편집 가능한 보조 입력으로 제공해 저장 payload에 반영해야 합니다.

**전체 판정**: 합격
**가중 점수**: 7.4 / 10.0

**항목별 점수**:
- 디자인 품질: 8/10 — 어드민 콘솔 전반이 차분한 패널형 상황판 톤으로 일관되고, 표·지표·보조 패널 간 위계가 명확합니다.
- 독창성: 7/10 — 미신청 추적을 참가자 관리 흐름 안에 결합한 점과 세션 통계 모달 구조는 템플릿성 대시보드보다 목적성이 뚜렷합니다.
- 기술적 완성도: 7/10 — 인증 보호, 상태 동기화, 필터/다운로드 연결은 안정적이지만 검증 실패 메시지 처리와 `ticketInfo` 보존 전략은 아직 거칠습니다.
- 기능성: 8/10 — 운영 실무에 필요한 조회, 수정, 추적, 다운로드, 세션 현황 확인 흐름이 대부분 한 번에 이어집니다.

**구체적 개선 지시**:
1. `src/lib/repositories/app-data.ts`와 `src/app/api/admin/participants/[participantId]/route.ts`에서 검증 실패를 `404`가 아니라 원인별 `400` 응답으로 분기하고, 실제 검증 메시지를 상세 패널 저장 피드백에 그대로 노출하세요.
2. `src/app/admin/_components/AdminParticipantDetailPanel.tsx`에 `ticketInfo` 전용 편집 경로를 추가해 Day 토글과 별개로 기존 티켓 문자열을 보존·수정할 수 있게 하세요.

**방향 판단**: 현재 방향 유지
