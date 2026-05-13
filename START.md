# 실행 방법

## 프로젝트 구조

```
harness_project_edit/
├── AGENTS.md                      ← 오케스트레이터 (Codex 마스터 지침서)
├── agents/
│   ├── evaluation_criteria.md     ← 공용 평가 기준
│   ├── planner.md                 ← Planner 서브에이전트 지시서
│   ├── generator.md               ← Generator 서브에이전트 지시서
│   └── evaluator.md               ← Evaluator 서브에이전트 지시서
├── output/                        ← 생성 결과물이 저장되는 폴더
├── SPEC.md                        ← Planner가 생성 (실행 후 생김)
├── SELF_CHECK.md                  ← Generator가 생성 (실행 후 생김)
├── QA_REPORT.md                   ← Evaluator가 생성 (실행 후 생김)
└── START.md                       ← 지금 이 파일
```

---

## 실행 방법

### 1단계: 코덱스(Codex) 작업 공간 설정

코덱스 에디터나 CLI 환경에서 이 폴더(harness_project_edit)를 루트 디렉토리로 엽니다.

### 2단계: 하네스 강제 실행 프롬프트 입력

코덱스는 파일 자동 인식 기능이 없을 수 있으므로, 프롬프트 입력창에 @AGENTS.md (또는 파일을 직접 멘션/첨부)를 참조시킨 후 아래와 같이 입력합니다.

```
@AGENTS.md 의 오케스트레이션 규칙에 따라 아래 작업을 실행해줘.
작업: AI 교육 전문 회사 사용성연구소의 랜딩페이지를 만들어줘
```

AGENTS.md의 지시에 따라 코덱스가 자동으로:

- Planner 지시서를 읽고 SPEC.md를 생성합니다.
- Generator 지시서를 읽고 output/index.html을 생성합니다.
- Evaluator 지시서를 읽고 QA_REPORT.md를 생성합니다.
- 불합격이면 Generator가 피드백을 반영하여 재작업합니다.
- 합격이면 완료 보고가 나옵니다.

### 3단계: 결과를 확인합니다

```bash
# 브라우저에서 생성된 파일 열기
open output/index.html
```

---

## 다른 과제에 적용하기

프롬프트의 '작업' 내용만 바꾸면 됩니다:

```
@AGENTS.md 의 오케스트레이션 규칙에 따라 아래 작업을 실행해줘.
작업: 브라우저에서 돌아가는 포모도로 타이머 앱을 만들어줘
```

agents/ 폴더의 지시서는 수정 없이 그대로 사용 가능합니다.
디자인 기준을 바꾸고 싶으면 agents/evaluation_criteria.md만 수정하세요.
