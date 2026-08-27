import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/components/AppLayout';
import { AuthLayout } from '@/shared/components/AuthLayout';
import HomePage from '@/features/home/HomePage';
import BucketPage from '@/features/bucket/BucketPage';
import MapPage from '@/features/map/MapPage';
import AssistPage from '@/features/assist/AssistPage';
import MyPage from '@/features/profile/MyPage';
import TicketDetailPage from '@/features/profile/ticket/TicketDetailPage'; // 티켓(마이 하위)
import EndTripPage from '@/features/profile/ticket/EndTripPage'; // 티켓(마이 하위)
import LoginPage from '@/features/auth/LoginPage';
import OAuthCallbackPage from '@/features/auth/OAuthCallbackPage';
import OnboardingPage from '@/features/onboarding/OnboardingPage';
import ProfileEditPage from '@/features/profile/ProfileEditPage';

// URL ↔ 페이지 매핑. 새 페이지는 features/{기능}/XxxPage.jsx 만들고 여기에 한 줄 추가.
export const router = createBrowserRouter([
  {
    element: <AuthLayout />, // 하단탭 없는 인증 전용 레이아웃 (앱 최대폭 + 배경색 공통)
    children: [
      { path: '/login', element: <LoginPage /> }, // ⚠️ 미연동: 아직 진입점 없음(주소 직접입력만). 첫진입/가드는 인증 담당이 연결
      { path: '/oauth/callback', element: <OAuthCallbackPage /> }, // OAuth 로그인 콜백 처리
      { path: '/onboarding', element: <OnboardingPage /> }, // 최초 로그인 시 프로필 설정
      { path: '/profile/edit', element: <ProfileEditPage /> }, // 프로필 수정
    ],
  },
  { path: '/ticket', element: <TicketDetailPage /> }, // 티켓 상세 + QR 공유 (MyPage 티켓카드 → 여기)
  { path: '/ticket/new', element: <EndTripPage /> }, // 여행 종료 · 기간 선택 (MyPage End trip → 여기)
  {
    element: <AppLayout />, // 하단 탭 내비 공통 레이아웃
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <HomePage /> }, // 홈 (디자인 깡통 — 홈 담당)
      { path: '/bucket', element: <BucketPage /> }, // 버킷리스트 (디자인 깡통 — 버킷 담당)
      { path: '/map', element: <MapPage /> }, // 지도 (백엔드 연동 완성 — 지도 담당)
      { path: '/assist', element: <AssistPage /> }, // AI 어시스트 (디자인 깡통 — 챗봇 담당)
      { path: '/my', element: <MyPage /> }, // 마이페이지 (디자인 깡통 — 프로필 담당)
    ],
  },
]);
