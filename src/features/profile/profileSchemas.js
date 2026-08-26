import { z } from 'zod';
import { SUPPORTED_NATIONALITIES } from '@/shared/constants/locationOptions';

const NATIONALITY_VALUES = SUPPORTED_NATIONALITIES.map((n) => n.value);

export const profileUpdateSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
  nationality: z
    .string()
    .refine((v) => NATIONALITY_VALUES.includes(v), '유효하지 않은 국가 코드입니다.'),
  profileImage: z.string().nullable().optional(),
});
