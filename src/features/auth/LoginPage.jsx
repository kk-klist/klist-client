export default function LoginPage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-8 bg-surface px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-primary">Klist+</h1>
        <p className="mt-2 text-sm text-muted-foreground">K-컬처 버킷리스트 여행 지도</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          className="w-full rounded-xl bg-[#FEE500] py-3.5 text-sm font-bold text-ink shadow-card"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;
          }}
        >
          카카오로 시작하기
        </button>
        <button
          type="button"
          disabled
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold shadow-card disabled:cursor-not-allowed disabled:opacity-50"
        >
          Google 로그인 (준비 중)
        </button>
      </div>

      <a href="/map" className="text-xs text-muted-foreground underline">
        로그인 없이 둘러보기 (데모)
      </a>
    </div>
  );
}
