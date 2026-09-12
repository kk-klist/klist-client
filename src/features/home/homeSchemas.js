import { z } from 'zod';

export const addPlaceToBucketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해주세요.')
    .max(100, '제목은 100자 이하로 입력해주세요.'),
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  description: z.string().trim().max(300, '설명은 300자 이하로 입력해주세요.'),
});
