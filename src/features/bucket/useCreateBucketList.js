import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCreateBucketListMutation } from './bucketApi';
import { useBucketCopy } from './bucketLocale';
import { createBucketDirectSchema } from './bucketSchemas';
import { toast } from '@/shared/utils/toast';

export function useCreateBucketList(open, onCreated) {
  const copy = useBucketCopy();
  const mutation = useCreateBucketListMutation();
  const submittedRef = useRef(false);
  const form = useForm({
    resolver: zodResolver(createBucketDirectSchema(copy)),
    defaultValues: { title: '', description: '', category: '' },
  });

  useEffect(() => {
    if (!open) return;
    submittedRef.current = false;
    form.reset({ title: '', description: '', category: '' });
  }, [form, open]);

  const submit = (values) => {
    if (submittedRef.current || mutation.isPending) return;
    submittedRef.current = true;
    mutation.mutate(
      {
        title: values.title.trim(),
        description: values.description.trim() || null,
        category: values.category,
        placeName: null,
        address: null,
        latitude: null,
        longitude: null,
        imageUrl: null,
      },
      {
        onSuccess: () => {
          toast.success(copy.directCreateSuccess);
          onCreated();
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
  const handleSubmit = (event) => form.handleSubmit(submit)(event);

  return { form, handleSubmit, isPending: mutation.isPending };
}
