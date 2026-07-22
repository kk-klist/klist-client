import { useEffect, useState } from 'react';
import { subscribeToast } from '@/shared/utils/toast';
import { cn } from '@/shared/utils/cn';

// 전역 토스트 렌더러. AppLayout 에 한 번만 마운트한다.
export function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(
    () =>
      subscribeToast((item) => {
        setItems((prev) => [...prev, item]);
        setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== item.id)), 2600);
      }),
    [],
  );

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-6">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'max-w-[86%] rounded-xl px-4 py-2 text-center text-[13px] text-white shadow-lg',
            item.type === 'error' && 'bg-destructive',
            item.type === 'success' && 'bg-success',
            item.type === 'default' && 'bg-ink',
          )}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
