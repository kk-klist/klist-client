import { z } from 'zod';

export const addPlaceToBucketSchema = (copy) =>
  z.object({
    title: z.string().trim().min(1, copy.titleRequired).max(100, copy.titleTooLong),
    category: z.string().min(1, copy.categoryRequired),
    description: z.string().trim().max(300, copy.descriptionTooLong),
  });
