import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { SUPPORTED_LANGUAGES } from '@/shared/constants/locationOptions';
import { cn } from '@/shared/utils/cn';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { getCountryFlagEmoji } from './countryFlag';
import { LanguageBottomSheet } from './LanguageBottomSheet';
import { LoginRequiredDialog } from './LoginRequiredDialog';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import { WithdrawConfirmDialog } from './WithdrawConfirmDialog';
import { useWithdrawMutation } from './profileApi';
import { useTicketsQuery } from './ticket/ticketApi';
import { EndTripBottomSheet } from './ticket/EndTripBottomSheet';

export default function MyPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [endTripSheetOpen, setEndTripSheetOpen] = useState(false);
  const [activeTicketIdx, setActiveTicketIdx] = useState(0);
  const ticketScrollRef = useRef(null);

  const {
    data: tickets = [],
    isLoading: ticketsLoading,
    isError: ticketsError,
  } = useTicketsQuery();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawMutation();

  const langLabel =
    SUPPORTED_LANGUAGES.find((l) => l.value === user?.preferredLanguage)?.label ?? '-';

  const handleLanguageClick = () => {
    if (!isAuthenticated) setLoginDialogOpen(true);
    else setLanguageSheetOpen(true);
  };

  const handleNotificationClick = () => {
    if (!isAuthenticated) setLoginDialogOpen(true);
    // 로그인 상태에서는 아직 실제 알림 설정 기능이 없어 placeholder로 둔다.
  };

  return (
    <div className="kb-page">
      {/* 프로필 */}
      <section>
        <div className="kb-card flex items-center gap-4 p-5">
          {isAuthenticated ? (
            user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-2 ring-black/80"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-track">
                <ProfileIcon />
              </span>
            )
          ) : (
            <span className="h-16 w-16 animate-pulse rounded-full bg-track" />
          )}
          <div className="flex-1 space-y-1.5">
            {isAuthenticated ? (
              <>
                <h1 className="text-[24px] font-extrabold tracking-tight">{user?.nickname}</h1>
                <p className="flex items-center gap-2 text-[18px]" aria-label="국가 및 선호 언어">
                  <span>{getCountryFlagEmoji(user?.nationality)}</span>
                  <span className="text-[14px] font-semibold text-muted-foreground">
                    {langLabel}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-semibold text-muted-foreground">
                  로그인하고 시작해요
                </p>
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
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate('/profile/edit')}
              className="rounded-full bg-track px-3 py-1.5 text-[12px] font-bold text-muted-foreground"
            >
              편집
            </button>
          )}
        </div>
      </section>

      {/* My tickets (스펙 2.5 — 항공권 카드) */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="kb-section">My tickets</h2>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white"
            onClick={() => {
              if (isAuthenticated) setEndTripSheetOpen(true);
              else setLoginDialogOpen(true);
            }}
          >
            여행 종료
          </button>
        </div>

        {!isAuthenticated ? (
          <button
            type="button"
            className="mt-3 block w-full space-y-3 overflow-hidden rounded-card bg-white p-4 text-left shadow-card"
            onClick={() => setLoginDialogOpen(true)}
          >
            <div className="h-9 w-full animate-pulse rounded bg-track" />
            <div className="h-8 w-full animate-pulse rounded bg-track" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-track" />
          </button>
        ) : ticketsLoading ? (
          <div className="mt-3 w-full space-y-3 overflow-hidden rounded-card bg-white p-4 shadow-card">
            <div className="h-9 w-full animate-pulse rounded bg-track" />
            <div className="h-8 w-full animate-pulse rounded bg-track" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-track" />
          </div>
        ) : ticketsError ? (
          <p className="mt-3 text-sm text-destructive">티켓을 불러오지 못했어요.</p>
        ) : tickets.length === 0 ? (
          <div className="mt-3 rounded-card bg-white p-6 text-center shadow-card">
            <p className="text-[14px] font-bold text-muted-foreground">아직 여행 티켓이 없어요</p>
            <p className="mt-1 text-[12px] text-muted2">여행 종료으로 첫 티켓을 만들어보세요</p>
          </div>
        ) : (
          <>
            <div
              ref={ticketScrollRef}
              onScroll={() => {
                const el = ticketScrollRef.current;
                if (el) setActiveTicketIdx(Math.round(el.scrollLeft / el.clientWidth));
              }}
              className="mt-3 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tickets.map((ticket) => (
                <div key={ticket.ticketId} className="w-full shrink-0 snap-center">
                  <button
                    type="button"
                    className="block w-full overflow-hidden rounded-card text-left shadow-card"
                    onClick={() => navigate('/ticket')}
                  >
                    <div className="flex items-center justify-between bg-brand-gradient px-4 py-2.5 text-white">
                      <span className="text-[12px] font-extrabold tracking-wide">
                        K-BUCKET · TRAVEL TICKET
                      </span>
                      <span className="text-[11px] font-bold opacity-80">
                        NO.{String(ticket.visitCount).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="bg-white px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[26px] font-extrabold leading-none">
                            {ticketDay(ticket.startDate)}
                          </p>
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            {ticketMonthYear(ticket.startDate)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">출발</p>
                        </div>
                        <div className="mx-3 flex-1 border-t border-dashed border-line2" />
                        <span className="text-primary">✈</span>
                        <div className="mx-3 flex-1 border-t border-dashed border-line2" />
                        <div className="text-right">
                          <p className="text-[26px] font-extrabold leading-none">
                            {ticketDay(ticket.endDate)}
                          </p>
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            {ticketMonthYear(ticket.endDate)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">도착</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-[13px]">
                        <span className="font-bold">
                          {ticket.startDate.replace(/-/g, '.')} –{' '}
                          {ticket.endDate.replace(/-/g, '.')}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-success">
                            완료 {ticket.completedCount}
                          </span>
                          {ticket.categories.map((cat) => (
                            <span
                              key={cat}
                              className="rounded-full bg-track px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            {tickets.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={activeTicketIdx === 0}
                  onClick={() => {
                    const el = ticketScrollRef.current;
                    if (el) el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-opacity disabled:opacity-30"
                >
                  <ChevronLeftIcon size={16} />
                </button>
                <div className="flex gap-1.5">
                  {tickets.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-200',
                        i === activeTicketIdx ? 'w-4 bg-primary' : 'w-1.5 bg-track',
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={activeTicketIdx === tickets.length - 1}
                  onClick={() => {
                    const el = ticketScrollRef.current;
                    if (el) el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-opacity disabled:opacity-30"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            )}
          </>
        )}
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
            onClick={handleLanguageClick}
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
          {isAuthenticated && (
            <SettingRow
              icon="⚠️"
              label="탈퇴하기"
              labelClass="text-destructive"
              value=""
              onClick={() => setWithdrawDialogOpen(true)}
            />
          )}
        </div>
      </section>

      <EndTripBottomSheet open={endTripSheetOpen} onOpenChange={setEndTripSheetOpen} />
      <LanguageBottomSheet open={languageSheetOpen} onOpenChange={setLanguageSheetOpen} />
      <LoginRequiredDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={logout}
        isPending={isLoggingOut}
      />
      <WithdrawConfirmDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={withdraw}
        isPending={isWithdrawing}
      />
    </div>
  );
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function ticketDay(dateStr) {
  return dateStr.split('-')[2];
}

function ticketMonthYear(dateStr) {
  const [y, m] = dateStr.split('-');
  return `${MONTHS[Number(m) - 1]} · ${y}`;
}

function ProfileIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="text-muted-foreground"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
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
