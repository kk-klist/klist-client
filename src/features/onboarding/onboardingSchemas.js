import { z } from 'zod';

export const SUPPORTED_LANGUAGES = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'zh-CN', label: '中文 (简体)' },
  { value: 'zh-TW', label: '中文 (繁體)' },
  { value: 'ru', label: 'Русский' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

export const SUPPORTED_NATIONALITIES = [
  { value: 'KR', label: '🇰🇷 한국' },
  { value: 'US', label: '🇺🇸 미국' },
  { value: 'JP', label: '🇯🇵 일본' },
  { value: 'CN', label: '🇨🇳 중국' },
  { value: 'TW', label: '🇹🇼 대만' },
  { value: 'VN', label: '🇻🇳 베트남' },
  { value: 'TH', label: '🇹🇭 태국' },
  { value: 'PH', label: '🇵🇭 필리핀' },
  { value: 'FR', label: '🇫🇷 프랑스' },
  { value: 'DE', label: '🇩🇪 독일' },
  { value: 'GB', label: '🇬🇧 영국' },
  { value: 'RU', label: '🇷🇺 러시아' },
  { value: 'ES', label: '🇪🇸 스페인' },
];

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
