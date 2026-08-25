import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { SUPPORTED_LANGUAGES } from '@/shared/constants/locationOptions';
import { cn } from '@/shared/utils/cn';
import { getCountryFlagEmoji } from './countryFlag';
import { LoginRequiredDialog } from './LoginRequiredDialog';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';

export default function MyPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const langLabel =
    SUPPORTED_LANGUAGES.find((l) => l.value === user?.preferredLanguage)?.label ?? '-';

  const guardedNavigate = (path) => {
    if (isAuthenticated) navigate(path);
    else setLoginDialogOpen(true);
  };

  const handleNotificationClick = () => {
    if (!isAuthenticated) setLoginDialogOpen(true);
    // 로그인 상태에서는 아직 실제 알림 설정 기능이 없어 placeholder로 둔다.
  };

  return (
    <div className="kb-page">
      {/* 프로필 */}
      <header className="kb-card flex items-center gap-4 p-5">
        {isAuthenticated ? (
          user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-black/80"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-2xl font-extrabold text-white ring-2 ring-black/80">
              {user?.nickname?.[0] ?? '?'}
            </span>
          )
        ) : (
          <span className="h-16 w-16 animate-pulse rounded-full bg-track ring-2 ring-black/20" />
        )}
        <div className="space-y-1.5">
          {isAuthenticated ? (
            <>
              <h1 className="text-[24px] font-extrabold tracking-tight">{user?.nickname}</h1>
              <p className="flex items-center gap-2 text-[18px]" aria-label="국가 및 선호 언어">
                <span>{getCountryFlagEmoji(user?.nationality)}</span>
                <span className="text-[14px] font-semibold text-muted-foreground">{langLabel}</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-[14px] font-semibold text-muted-foreground">로그인하고 시작해요</p>
              <button
                type="button"
                className="rounded-full bg-primary px-4 py-1.5 text-[13px] font-bold text-white"
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
            </>
          )}
        </div>
      </header>

      {/* My tickets (스펙 2.5 — 항공권 카드) */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="kb-section">My tickets</h2>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white"
            onClick={() => guardedNavigate('/ticket/new')}
          >
            End trip
          </button>
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            className="mt-3 block w-full overflow-hidden rounded-card text-left shadow-card"
            onClick={() => guardedNavigate('/ticket')}
          >
            {/* 티켓 헤더 (보라 스텁) */}
            <div className="flex items-center justify-between bg-brand-gradient px-4 py-2.5 text-white">
              <span className="text-[12px] font-extrabold tracking-wide">
                K-BUCKET · TRAVEL TICKET
              </span>
              <span className="text-[11px] font-bold opacity-80">NO.001</span>
            </div>

            {/* 티켓 본문 (항공권) */}
            <div className="bg-white px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[26px] font-extrabold leading-none">ICN</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">INCHEON</p>
                </div>
                <div className="mx-3 flex-1 border-t border-dashed border-line2" />
                <span className="text-primary">✈</span>
                <div className="mx-3 flex-1 border-t border-dashed border-line2" />
                <div className="text-right">
                  <p className="text-[26px] font-extrabold leading-none">SEL</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">SEOUL · 1st VISIT</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-[13px]">
                <span className="font-bold">2026.07.12 – 07.18</span>
                <span className="font-bold text-success">완료 3</span>
                <span className="text-muted-foreground">저장 12</span>
              </div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            className="mt-3 block w-full space-y-3 overflow-hidden rounded-card bg-white p-4 text-left shadow-card"
            onClick={() => guardedNavigate('/ticket')}
          >
            <div className="h-9 w-full animate-pulse rounded bg-track" />
            <div className="h-8 w-full animate-pulse rounded bg-track" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-track" />
          </button>
        )}
        <p className="mt-2 text-[12px] text-muted2">
          티켓을 누르면 상세 화면으로 이동해요 · 여행 종료로 새 티켓을 만들 수 있어요
        </p>
      </section>

      {/* 설정 */}
      <section>
        <h2 className="kb-section">Settings</h2>
        <div className="kb-card mt-3 divide-y divide-line">
          <SettingRow
            icon="A문"
            label="Language"
            value={isAuthenticated ? langLabel : '-'}
            valueClass="text-primary"
          />
          <SettingRow
            icon="🔔"
            label="알림 설정"
            value="켜짐"
            valueClass="text-muted-foreground"
            onClick={handleNotificationClick}
          />
          {isAuthenticated && (
            <SettingRow
              icon="🚪"
              label="로그아웃"
              labelClass="text-destructive"
              value=""
              onClick={() => setLogoutDialogOpen(true)}
            />
          )}
        </div>
      </section>

      <LoginRequiredDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={logout}
        isPending={isLoggingOut}
      />
    </div>
  );
}

function SettingRow({ icon, label, labelClass, value, valueClass, onClick }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3.5 p-4 text-left"
      onClick={onClick}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-track text-[13px] font-bold">
        {icon}
      </span>
      <p className={cn('flex-1 text-[15px] font-bold', labelClass)}>{label}</p>
      <p className={cn('text-[14px] font-bold', valueClass)}>{value}</p>
    </button>
  );
}
