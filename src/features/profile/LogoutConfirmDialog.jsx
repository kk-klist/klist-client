import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useProfileCopy } from './profileLocale';

export function LogoutConfirmDialog({ open, onOpenChange, onConfirm, isPending }) {
  const copy = useProfileCopy();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.logoutTitle}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {copy.no}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {copy.yes}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
