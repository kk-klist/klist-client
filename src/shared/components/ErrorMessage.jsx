import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ message = '오류가 발생했습니다.' }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-destructive">
      <AlertCircle className="size-6" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
