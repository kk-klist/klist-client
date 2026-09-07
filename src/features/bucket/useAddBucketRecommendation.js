import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCreateBucketListMutation } from './bucketApi';
import { useBucketCopy } from './bucketLocale';
import { createBucketRecommendationSchema } from './bucketSchemas';
import { toast } from '@/shared/utils/toast';

function cleanDescription(value) {
  if (!value) return undefined;
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function useAddBucketRecommendation(recommendation, detail, onAdded, open = true) {
  const copy = useBucketCopy();
  const createMutation = useCreateBucketListMutation();
  const submittedRef = useRef(false);
  const form = useForm({
    resolver: zodResolver(createBucketRecommendationSchema(copy)),
    defaultValues: {
      title: '',
      description: cleanDescription(detail?.overview) ?? '',
    },
  });

  useEffect(() => {
    if (!open) return;
    submittedRef.current = false;
    form.reset({
      title: '',
      description: cleanDescription(detail?.overview) ?? '',
    });
  }, [detail?.overview, form, open]);

  const submitRecommendation = (values) => {
    if (submittedRef.current || createMutation.isPending) return;
    submittedRef.current = true;

    createMutation.mutate(
      {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        category: recommendation.category,
        placeName: detail?.title ?? recommendation.title,
        address: detail?.address ?? recommendation.address ?? undefined,
        latitude: detail?.latitude ?? recommendation.latitude,
        longitude: detail?.longitude ?? recommendation.longitude,
        imageUrl: detail?.imageUrl ?? recommendation.imageUrl ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success(copy.addSuccess);
          onAdded();
        },
        onError: (error) => {
          submittedRef.current = false;
          if (error?.code === 'INVALID_INPUT') {
            error.errors?.forEach(({ field, reason }) => form.setError(field, { message: reason }));
          } else {
            toast.error(error?.message ?? copy.addError);
          }
        },
      },
    );
  };
  const handleSubmit = (event) => form.handleSubmit(submitRecommendation)(event);

  return {
    form,
    handleSubmit,
    isPending: createMutation.isPending,
  };
}
