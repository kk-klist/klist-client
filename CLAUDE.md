# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 따라야 할 규칙이다.

## 프로젝트 개요

React SPA. 백엔드(Spring) 개발자 중심 팀이므로 **컨벤션을 엄격히 따르는 것이 최우선**이다. 임의로 새로운 패턴/라이브러리를 도입하지 않는다.

## 기술 스택

- 빌드: Vite
- 언어: **JavaScript만 사용. TypeScript 금지.** JSX가 있는 파일만 `.jsx`, 나머지는 `.js`
- 라우팅: React Router
- 서버 데이터: axios + TanStack Query
- 전역 상태: Redux Toolkit (사실상 로그인 사용자 정보 전용)
- 폼/검증: react-hook-form + zod
- 스타일: Tailwind CSS
- 공통 UI: shadcn/ui (JS 모드, `tsx: false`)

## 폴더 구조

```
src/
├── app/          # 전역 설정 (store.js, router.jsx, queryClient.js)
├── features/     # 기능(도메인) 단위 폴더 ★ 핵심
│   └── {기능}/   # XxxPage.jsx, xxxApi.js, xxxSchemas.js, useXxx.js, xxxSlice.js
├── shared/       # 2개 이상 기능에서 쓰는 공통 요소
│   ├── components/  # shadcn/ui 포함
│   ├── hooks/
│   ├── api/client.js  # axios 인스턴스
│   └── utils/
├── styles/index.css   # 유일하게 허용되는 CSS 파일
├── App.jsx
└── main.jsx
```

### 폴더 규칙 (위반 금지)

1. 새 파일은 무조건 해당 기능 폴더(`features/{기능}/`)에 만든다. "나중에 공용이 될 것 같다"는 예상만으로 `shared`에 만들지 않는다. 실제로 2개 이상 기능에서 쓰게 될 때 `shared`로 옮긴다.
2. `shared` 코드는 특정 기능을 알면 안 된다. 기능 분기(`if (type === 'checklist')`)가 필요하면 그 기능 폴더로 옮긴다.
3. **기능 폴더 간 직접 import 금지.** 공유가 필요하면 `shared`로 승격 후 양쪽에서 import. 예외: 로그인 사용자 정보는 Redux(`authSlice`)를 통해 읽는다.
4. import 방향은 `app → features → shared` 한 방향만. 역방향 import가 필요해지면 파일 위치가 잘못된 것이다.

## 컴포넌트 규칙 (= 백엔드 Controller)

- 컴포넌트에는 JSX와 간단한 표시용 분기만 둔다. API 호출, 계산, 복잡한 로직은 훅으로 뺀다.
- 조회 화면은 반드시 **로딩 → 에러 → 빈 데이터 → 정상** 순서로 4가지 상태를 모두 처리한다.

```jsx
if (isLoading) return <Spinner />;
if (isError) return <ErrorMessage message="..." />;
if (list.length === 0) return <EmptyState message="..." />;
return ( /* 정상 렌더 */ );
```

- `map` 렌더링 시 `key`는 서버가 준 `id`를 쓴다. 배열 인덱스 금지.
- 한 파일에 컴포넌트 하나. 파일명 = 컴포넌트명 (PascalCase).
- 페이지 컴포넌트(라우터 연결)만 `export default`, 나머지는 `export function`.
- 컴포넌트가 150줄을 넘으면 분리를 검토한다.

## state 배치 규칙

| 값의 종류 | 위치 |
| --- | --- |
| 서버 데이터 (목록, 상세) | TanStack Query — **useState/Redux에 재저장 절대 금지** |
| 화면 로컬 값 (모달 열림, 입력값) | `useState` |
| 앱 전체 공유 값 (로그인 사용자) | Redux slice |
| 페이지 번호, 검색어 | URL 쿼리스트링 (`useSearchParams`) |
| 부모→자식 2~3단계 전달 | 그냥 props (전역화하지 않는다) |

- 멀리 떨어진 컴포넌트가 같은 서버 데이터를 쓸 때는 각자 같은 Query 훅을 호출한다 (queryKey가 같으면 캐시 공유, API 재호출 없음).
- 새 Redux 상태 추가 전 자문: 2개 이상 기능에서 필요한가? 서버 데이터가 아닌가? URL로 표현 불가한가? 셋 다 통과할 때만 추가.
- slice는 소유 기능 폴더에 두고, 다른 기능은 `useSelector`로 읽기만 한다. dispatch는 소유 기능만.

## 커스텀 훅 규칙 (= 백엔드 Service)

- "폼 검증 → API 호출 → 성공 시 알림/이동" 같은 유스케이스 흐름을 훅 하나로 묶는다.
- 이름: `use + 동사 + 대상` (`useCreateChecklist`, `useLogin`).
- 단순 조회 화면은 `useXxxQuery()`를 컴포넌트에서 바로 써도 된다. 폼/이동/에러 분기가 얽히면 커스텀 훅으로 분리.
- 훅은 JSX를 반환하지 않는다. 값과 함수만 객체로 반환.

## API 규칙

### axios (`shared/api/client.js`)

- 모든 요청은 `client` 인스턴스를 통한다. 인터셉터가 토큰 첨부, `{ success, data }` 껍데기 제거, 401 전역 처리를 담당한다.
- 따라서 `client.get(...)`의 결과는 곧바로 알맹이 데이터이고, catch로 잡히는 값은 곧바로 `{ code, message, errors }`다.

### 기능별 API 파일 (`features/{기능}/xxxApi.js`)

- ① 순수 API 호출 함수 + ② 그것을 감싼 Query 훅을 한 파일에 둔다.
- **컴포넌트/훅에서 axios 직접 호출 금지.** 반드시 Query 훅을 통한다.
- 조회 = `useQuery`, 생성/수정/삭제 = `useMutation`만 사용.
- mutation의 `onSuccess`에서 반드시 `invalidateQueries({ queryKey: ['{기능명}'] })` 호출 (기능명 하나로 무효화 → 하위 캐시 전부 무효화).
- API 함수 이름은 백엔드 Service 메서드명과 맞춘다 (조회는 `fetchXxx`).

### queryKey 패턴 (이 외 형식 금지)

| 상황 | queryKey |
| --- | --- |
| 목록 전체 | `['{기능명}']` |
| 단건 | `['{기능명}', id]` |
| 검색/필터 목록 | `['{기능명}', 'list', 조건객체]` |

## 폼/검증 규칙 (= 백엔드 @Valid)

- 모든 폼은 react-hook-form + zod로만 만든다. `useState` 수동 폼 금지.
- 검증 규칙은 `{기능}Schemas.js`에 모으고, **백엔드 Request DTO의 Bean Validation과 1:1로 동일하게** 맞춘다 (더 느슨해도, 더 엄격해도 안 됨).
- 생성/수정 검증이 다르면 `xxxCreateSchema` / `xxxUpdateSchema`로 분리 (억지 재사용 금지).
- 서버 400 `INVALID_INPUT` 응답의 `errors` 배열은 `form.setError`로 필드에 표시:

```jsx
if (errorResponse.code === 'INVALID_INPUT') {
  errorResponse.errors?.forEach((e) => form.setError(e.field, { message: e.reason }));
}
```

## 에러 처리 규칙

- 에러 분기는 **반드시 `code`로만** 한다 (`message`는 서버가 언제든 바꿀 수 있음).
- 사용자에게 보여주는 문구는 서버 `message`를 그대로 쓴다. 프론트 하드코딩은 네트워크 오류 fallback만 허용.
- 401 분기를 개별 화면에 두지 않는다 (`client.js` 인터셉터가 전역 처리).

## 스타일 규칙

- Tailwind class로만 작성. `style={{}}` 인라인 스타일, 별도 `.css` 파일 생성 금지 (`styles/index.css`만 예외).
- 조건부 class는 `shared/utils`의 `cn()` 사용. 문자열 직접 연결 금지.
- 색상 코드 직접 사용 금지 (`text-[#3b82f6]` ✗). `tailwind.config.js`에 정의된 이름(`primary`, `destructive` 등)만 사용. 새 색은 config 등록 후 사용.
- Button, Input, Dialog 등은 shadcn/ui 것을 사용. 같은 역할의 컴포넌트를 기능 폴더에 새로 만들지 않는다.

## 네이밍 요약

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 파일 | PascalCase `.jsx` | `ChecklistItem.jsx` |
| 페이지 컴포넌트 | `XxxPage.jsx` + `export default` | `ChecklistPage.jsx` |
| 커스텀 훅 | `use동사대상.js` | `useCreateChecklist.js` |
| API 파일 | `{기능}Api.js` | `checklistApi.js` |
| zod 스키마 파일 | `{기능}Schemas.js` | `checklistSchemas.js` |
| Redux slice | `{기능}Slice.js` | `authSlice.js` |
| API 호출 함수 | 조회 `fetchXxx`, 나머지 백엔드 메서드명 동일 | `fetchChecklists` |
| Query 훅 | 조회 `useXxxQuery`, 변경 `useXxxMutation` | `useChecklistsQuery` |
| 함수/변수 | camelCase | `formatDate` |
| 상수 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |

## 페이징

- 요청 파라미터: `page`(0부터 시작) / `size` / `sort`
- 응답: `page.content`(목록), `page.hasNext`, `page.totalPages`, `page.totalElements`

## 커밋 규칙

커밋 메시지는 `type: 내용` 형식으로 쓴다. `type`은 아래 중 하나만 사용한다.

| type | 용도 |
| --- | --- |
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 코드 구조 개선 |
| `style` | 포맷·세미콜론 등 코드 의미 없는 변경 (Tailwind class 조정 포함) |
| `docs` | 문서 (README, CLAUDE.md 등) |
| `chore` | 빌드 설정, 패키지 설치, 설정 파일 (Vite/Tailwind/shadcn 세팅 등) |
| `test` | 테스트 코드 |
