import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { genreToCategory, useAddPlaceToBucketMutation } from './homeApi';
import { addPlaceToBucketSchema } from './homeSchemas';
import { toast } from '@/shared/utils/toast';

function cleanDescription(value) {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function useAddPlaceToBucket(place, onAdded, open = true) {
  const mutation = useAddPlaceToBucketMutation();
  const submittedRef = useRef(false);
  const form = useForm({
    resolver: zodResolver(addPlaceToBucketSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    submittedRef.current = false;
    form.reset({
      title: '',
      category: genreToCategory(place?.genre),
      description: cleanDescription(place?.overview),
    });
  }, [form, open, place?.genre, place?.overview]);

  const submit = (values) => {
    if (submittedRef.current || mutation.isPending) return;
    submittedRef.current = true;

    mutation.mutate(
      {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        category: values.category,
        placeName: place?.title,
        address: place?.addr ?? undefined,
        latitude: place?.lat ?? null,
        longitude: place?.lng ?? null,
        imageUrl: place?.thumbnail ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success('버킷리스트에 담았어요.');
          onAdded();
        },
        onError: (error) => {
          submittedRef.current = false;
          if (error?.code === 'INVALID_INPUT') {
            error.errors?.forEach(({ field, reason }) => form.setError(field, { message: reason }));
          } else {
            toast.error(error?.message ?? '버킷리스트에 담지 못했어요.');
          }
        },
      },
    );
  };
  const handleSubmit = (event) => form.handleSubmit(submit)(event);

  return { form, handleSubmit, isPending: mutation.isPending };
}
