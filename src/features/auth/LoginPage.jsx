const COPY = {
  subtitle: 'K-Culture Bucket List Travel Map',
  kakao: 'Continue with Kakao',
  google: 'Continue with Google',
  browseWithoutLogin: 'Browse without signing in',
};

export default function LoginPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-primary">Klist+</h1>
        <p className="mt-2 text-sm text-muted-foreground">{COPY.subtitle}</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          className="w-full rounded-xl bg-[#FEE500] py-3.5 text-sm font-bold text-ink shadow-card"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;
          }}
        >
          {COPY.kakao}
        </button>
        <button
          type="button"
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold shadow-card"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
          }}
        >
          {COPY.google}
        </button>
      </div>

      <a href="/map" className="text-xs text-muted-foreground underline">
        {COPY.browseWithoutLogin}
      </a>
    </div>
  );
}
