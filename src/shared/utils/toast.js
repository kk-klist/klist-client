// 최소 공통 토스트 (외부 라이브러리 도입 금지 규칙 → sonner 대체).
// 사용: import { toast } from '@/shared/utils/toast'; toast.success('저장됨')
// 렌더는 shared/components/Toaster 가 담당. (AppLayout 에 1회 마운트)
const listeners = new Set();
let seq = 0;

function emit(message, type) {
  const item = { id: ++seq, message, type };
  listeners.forEach((fn) => fn(item));
}

export const toast = Object.assign((message) => emit(message, 'default'), {
  success: (message) => emit(message, 'success'),
  error: (message) => emit(message, 'error'),
});

export function subscribeToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
