// ✂️ 이 파일은 "참고용 예시"입니다 — 자유롭게 지우고 새로 작성해도 됩니다.
//    (색은 tailwind 토큰만, 다른 features 폴더 import 금지 — docs 두 문서 참고)
// [깡통] 로그인 / 온보딩 — 담당: 인증 담당자
//
// ⚠️ 미연동(placeholder) 상태입니다.
//    현재 /login 경로는 등록만 돼 있고 UI 어디서도 진입하지 않습니다.
//    (앱 첫 진입 '/' 는 /home 으로 리다이렉트, 인증 가드도 아직 없음.)
//    → 주소창에 직접 /login 을 쳐야만 보입니다.
//    인증 담당이 진입점을 연결해 주세요:
//      · 첫 진입을 로그인으로: router.jsx 의 '/' → <Navigate to="/login">
//      · 미로그인 튕김: 보호 라우트/가드에서 토큰 없으면 /login 으로
//
// TODO(담당자):
//  1) 카카오/구글 OAuth 시작 → 콜백 처리 → accessToken 을 localStorage 'accessToken' 에 저장
//     (shared/api/client.js 가 자동으로 Authorization 헤더에 붙여준다)
//  2) 로그인 성공 시 dispatch(setUser({...})) 후 온보딩(국적/선호언어) 모달 → /map 이동
//  3) authApi.js 만들어 API 호출은 Query 훅으로 (기준문서 4장)
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
          onClick={() => alert('TODO: 카카오 로그인 연동 (인증 담당)')}
        >
          카카오로 시작하기
        </button>
        <button
          type="button"
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold shadow-card"
          onClick={() => alert('TODO: Google 로그인 연동 (인증 담당)')}
        >
          Google로 시작하기
        </button>
      </div>

      <a href="/map" className="text-xs text-muted-foreground underline">
        로그인 없이 둘러보기 (데모)
      </a>
    </div>
  );
}
