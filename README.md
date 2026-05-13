# manna IC

Mock data 기반 선택강의 신청 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

## 주요 경로

- `/` 사용자 화면
- `/admin` 어드민 화면

## 샘플 계정

- 사용자: `김하늘 / 010-1111-2222`
- 사용자: `이준호 / 010-2222-3333`
- 사용자: `박서연 / 010-3333-4444`
- 어드민: `운영자 / 010-0000-0000`

## 구조

- `src/mocks`: mock data
- `src/types`: 도메인 타입
- `src/utils`: 날짜, 강의, 신청, 로그인 관련 유틸
- `src/store`: mock state management
- `src/app`: 사용자 화면과 어드민 화면
