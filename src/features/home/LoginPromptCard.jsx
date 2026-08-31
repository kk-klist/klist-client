import { useNavigate } from 'react-router-dom';

export function LoginPromptCard({ message }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/login')}
      className="kb-card flex w-full items-center gap-3 p-4 text-left"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        👤
      </span>
      <p className="flex-1 truncate text-[14px] font-bold text-muted-foreground">{message}</p>
      <span className="text-muted-foreground">›</span>
    </button>
  );
}
