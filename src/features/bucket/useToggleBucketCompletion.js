import { useUpdateBucketCompletionMutation } from './bucketApi';
import { useBucketCopy } from './bucketLocale';
import { toast } from '@/shared/utils/toast';

export function useToggleBucketCompletion(bucketList) {
  const completionMutation = useUpdateBucketCompletionMutation();
  const copy = useBucketCopy();

  const toggleCompletion = () => {
    completionMutation.mutate(
      {
        bucketListId: bucketList.bucketListId,
        isCompleted: !bucketList.isCompleted,
      },
      {
        onError: (error) => {
          toast.error(error?.message ?? copy.toggleError);
        },
      },
    );
  };

  return {
    isPending: completionMutation.isPending,
    toggleCompletion,
  };
}
