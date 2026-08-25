import { z } from 'zod';

export const chatQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, '질문을 입력해주세요.')
    .max(4000, '질문은 4000자 이내로 입력해주세요.'),
});
