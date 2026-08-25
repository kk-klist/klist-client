import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function LogoutConfirmDialog({ open, onOpenChange, onConfirm, isPending }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>로그아웃 하시겠습니까?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            아니오
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            예
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
