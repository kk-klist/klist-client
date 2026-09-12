import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUpdateBucketListMutation } from './bucketApi';
import { useBucketCopy } from './bucketLocale';
import { createBucketUpdateSchema } from './bucketSchemas';
import { toast } from '@/shared/utils/toast';

export function useEditBucketList(bucketList, open, onUpdated) {
  const copy = useBucketCopy();
  const updateMutation = useUpdateBucketListMutation();
  const submittedRef = useRef(false);
  const form = useForm({
    resolver: zodResolver(createBucketUpdateSchema(copy)),
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    submittedRef.current = false;
    form.reset({
      title: bucketList?.title ?? '',
      description: bucketList?.description ?? '',
    });
  }, [bucketList, form, open]);

  const submit = (values) => {
    if (!bucketList?.bucketListId || submittedRef.current || updateMutation.isPending) return;
    submittedRef.current = true;
    updateMutation.mutate(
      {
        bucketListId: bucketList.bucketListId,
        request: {
          title: values.title.trim(),
          description: values.description.trim() || null,
          category: bucketList.category,
          placeName: bucketList.placeName,
          address: bucketList.address,
          latitude: bucketList.latitude,
          longitude: bucketList.longitude,
          imageUrl: bucketList.imageUrl,
        },
      },
      {
        onSuccess: () => {
          toast.success(copy.updateSuccess);
          onUpdated();
        },
        onError: (error) => {
          submittedRef.current = false;
          if (error?.code === 'INVALID_INPUT') {
            error.errors?.forEach(({ field, reason }) => form.setError(field, { message: reason }));
          } else {
            toast.error(error?.message ?? copy.updateError);
          }
        },
      },
    );
  };
  const handleSubmit = (event) => form.handleSubmit(submit)(event);

  return {
    form,
    handleSubmit,
    isPending: updateMutation.isPending,
  };
}
