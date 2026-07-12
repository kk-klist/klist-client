# klist-client

React SPA. 프로젝트 컨벤션은 [CLAUDE.md](./CLAUDE.md) 참고 (폴더 구조, 컴포넌트/훅/API/폼 작성 규칙 등 전부 명시되어 있음).

## 기술 스택

- 빌드: Vite
- 언어: JavaScript (TypeScript 미사용)
- 라우팅: React Router
- 서버 데이터: axios + TanStack Query
- 전역 상태: Redux Toolkit
- 폼/검증: react-hook-form + zod
- 스타일: Tailwind CSS v4 + shadcn/ui

## 시작하기

```bash
npm install
npm run dev
```

- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 검사

## 폴더 구조

```
src/
├── app/       전역 설정 (store, router, queryClient)
├── features/  기능(도메인) 단위 폴더
├── shared/    2개 이상 기능에서 쓰는 공통 요소 (components, hooks, api, utils)
└── styles/    유일하게 허용되는 CSS 파일 위치
```

자세한 규칙은 [CLAUDE.md](./CLAUDE.md)를 따른다.
