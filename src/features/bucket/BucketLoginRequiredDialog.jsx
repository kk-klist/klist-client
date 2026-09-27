import { useNavigate } from 'react-router-dom';

import { useBucketCopy } from './bucketLocale';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function BucketLoginRequiredDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const copy = useBucketCopy();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.loginRequiredTitle}</DialogTitle>
          <DialogDescription>{copy.loginRequiredDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {copy.cancel}
          </Button>
          <Button onClick={() => navigate('/login')}>{copy.goToLogin}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
