import { z } from 'zod';
import { SUPPORTED_LANGUAGES, SUPPORTED_NATIONALITIES } from '@/shared/constants/locationOptions';

export { SUPPORTED_LANGUAGES, SUPPORTED_NATIONALITIES };

const LANGUAGE_VALUES = SUPPORTED_LANGUAGES.map((l) => l.value);
const NATIONALITY_VALUES = SUPPORTED_NATIONALITIES.map((n) => n.value);

export const onboardingSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
  profileImage: z.string().nullable().optional(),
  nationality: z
    .string()
    .refine((v) => NATIONALITY_VALUES.includes(v), '유효하지 않은 국가 코드입니다.'),
  preferredLanguage: z
    .string()
    .refine((v) => LANGUAGE_VALUES.includes(v), '지원하지 않는 언어입니다.'),
});
