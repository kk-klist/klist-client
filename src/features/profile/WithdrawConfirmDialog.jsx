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

export function WithdrawConfirmDialog({ open, onOpenChange, onConfirm, isPending }) {
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
          <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">
            <li>버킷리스트, 여행 티켓 등 모든 데이터가 삭제됩니다.</li>
            <li>삭제된 데이터는 복구할 수 없습니다.</li>
            <li>카카오 계정의 앱 연결도 함께 해제됩니다.</li>
          </ul>

          <textarea
            {...register('reason')}
            placeholder="탈퇴 사유를 입력해주세요."
            rows={4}
            disabled={isPending}
            className="w-full resize-none rounded-lg border border-line bg-background p-3 text-[14px] placeholder:text-muted2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            아니오
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isPending}
          >
            예
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
