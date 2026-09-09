import { z } from 'zod';

export const createBucketRecommendationSchema = (copy) =>
  z.object({
    title: z.string().trim().min(1, copy.titleRequired).max(100, copy.titleTooLong),
    description: z.string().trim().max(10000, copy.descriptionTooLong),
  });

export const createBucketUpdateSchema = createBucketRecommendationSchema;

export const createBucketDirectSchema = (copy) =>
  createBucketRecommendationSchema(copy).extend({
    category: z.string().min(1, copy.categoryRequired),
  });
