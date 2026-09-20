import { useUpdateBucketCompletionMutation } from './homeApi';
import { useHomeCopy } from './homeLocale';
import { toast } from '@/shared/utils/toast';

export function useCompleteCheckin() {
  const copy = useHomeCopy();
  const mutation = useUpdateBucketCompletionMutation();

  const completeCheckin = (bucketListId) => {
    if (mutation.isPending) return;

    mutation.mutate(
      { bucketListId, isCompleted: true },
      {
        onSuccess: () => toast.success(copy.checkinSuccess),
        onError: (error) => toast.error(error?.message ?? copy.checkinCompleteError),
      },
    );
  };

  return { completeCheckin, isPending: mutation.isPending };
}
