import { useUpdateBucketCompletionMutation } from './bucketApi';
import { toast } from '@/shared/utils/toast';

export function useToggleBucketCompletion(bucketList) {
  const completionMutation = useUpdateBucketCompletionMutation();

  const toggleCompletion = () => {
    completionMutation.mutate(
      {
        bucketListId: bucketList.bucketListId,
        isCompleted: !bucketList.isCompleted,
      },
      {
        onError: (error) => {
          toast.error(error?.message ?? '완료 상태를 변경하지 못했습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  return {
    isPending: completionMutation.isPending,
    toggleCompletion,
  };
}
