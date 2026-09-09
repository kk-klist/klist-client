import { useDeleteBucketListMutation } from './bucketApi';
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
import { toast } from '@/shared/utils/toast';

export function BucketDeleteDialog({ bucketListId, open, onOpenChange, onDeleted }) {
  const copy = useBucketCopy();
  const mutation = useDeleteBucketListMutation();
  const handleDelete = () => {
    if (!bucketListId || mutation.isPending) return;
    mutation.mutate(bucketListId, {
      onSuccess: () => {
        toast.success(copy.deleteSuccess);
        onDeleted();
      },
      onError: (error) => toast.error(error?.message ?? copy.deleteError),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{copy.deleteTitle}</DialogTitle>
          <DialogDescription>{copy.deleteConfirm}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {copy.cancel}
          </Button>
          <Button variant="destructive" disabled={mutation.isPending} onClick={handleDelete}>
            {mutation.isPending ? copy.deleting : copy.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
