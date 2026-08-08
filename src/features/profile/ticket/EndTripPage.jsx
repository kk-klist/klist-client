import { useNavigate } from 'react-router-dom';
import EndTripSheet from './EndTripSheet';

// [디자인 깡통 · 예시] 여행 종료 진입 페이지 — MyPage 의 End trip → /ticket/new 로 라우팅.
// (features 간 직접 import 없이 URL 로만 연결)
export default function EndTripPage() {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 bg-surface">
      <EndTripSheet onClose={() => navigate('/my')} onCreate={() => navigate('/ticket')} />
    </div>
  );
}
