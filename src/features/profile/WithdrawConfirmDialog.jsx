import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { withdrawSchema } from './profileSchemas';
import { useProfileCopy } from './profileLocale';

export function WithdrawConfirmDialog({ open, onOpenChange, onConfirm, isPending }) {
  const copy = useProfileCopy();
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm({
    resolver: zodResolver(withdrawSchema),
    mode: 'onChange',
  });

  const handleOpenChange = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = ({ reason }) => onConfirm({ reasons: [reason] });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.withdrawTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">
            <li>{copy.withdrawWarningData}</li>
            <li>{copy.withdrawWarningNoRecovery}</li>
          </ul>

          <textarea
            {...register('reason')}
            placeholder={copy.withdrawReasonPlaceholder}
            rows={4}
            disabled={isPending}
            className="w-full resize-none rounded-lg border border-line bg-background p-3 text-[14px] placeholder:text-muted2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            {copy.no}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isPending}
          >
            {copy.yes}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
