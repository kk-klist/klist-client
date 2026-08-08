// 깡통(미구현) 페이지 공통 틀 — 담당자가 실제 화면으로 교체한다.
// props 로만 동작하며 특정 기능을 알지 않는다 (shared 규칙 2).
export function PageStub({ icon = '🚧', title, owner, todos = [] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="text-5xl">{icon}</span>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        담당: <b className="text-ink">{owner}</b> — 이 화면은 깡통(스캐폴드)입니다.
      </p>
      {todos.length > 0 && (
        <ul className="w-full max-w-xs space-y-1.5 rounded-xl bg-white p-4 text-left text-[13px] text-muted-foreground shadow-card">
          {todos.map((todo) => (
            <li key={todo}>☐ {todo}</li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        작업 방법은{' '}
        <code className="rounded bg-primary-soft px-1 text-primary">
          docs/프론트엔드_기준문서.md
        </code>{' '}
        참고
      </p>
    </div>
  );
}
