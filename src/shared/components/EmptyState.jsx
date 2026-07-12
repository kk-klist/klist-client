import { Inbox } from 'lucide-react';

export function EmptyState({ message = '데이터가 없습니다.' }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
      <Inbox className="size-6" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
