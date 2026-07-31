import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { Toaster } from '@/shared/components/Toaster';

// 목업 하단 내비(Home·Bucket·Map·Me) + AI 어시스트 탭 추가 (5페이지)
const TABS = [
  { to: '/home', label: 'Home', icon: HomeIcon },
  { to: '/bucket', label: 'Bucket', icon: ListIcon },
  { to: '/map', label: 'Map', icon: PinIcon },
  { to: '/assist', label: 'AI Chat', icon: SparkIcon },
  { to: '/my', label: 'MyPage', icon: UserIcon },
];

export function AppLayout() {
  return (
    <div className="fixed inset-0 mx-auto flex max-w-[560px] flex-col bg-surface">
      <main className="relative flex-1 overflow-hidden">
        <Outlet />
      </main>
      <Toaster />
      <nav className="flex h-[60px] shrink-0 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-lg">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold',
                isActive ? 'text-primary' : 'text-muted2',
              )
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/* 목업 라인 아이콘 (stroke=currentColor 라 활성 시 핑크로 자동 변경) */
function HomeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 6h12M9 12h12M9 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="3" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}
