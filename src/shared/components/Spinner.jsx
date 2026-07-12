import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

export function Spinner({ className }) {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Loader2 className={cn('size-6 animate-spin text-muted-foreground', className)} />
    </div>
  );
}
