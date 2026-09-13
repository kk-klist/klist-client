import { z } from 'zod';
import { ASSIST_LOCALE } from './assistLocale';

export const createChatQuerySchema = (language = 'ko') =>
  z.object({
    query: z
      .string()
      .trim()
      .min(1, ASSIST_LOCALE[language].required)
      .max(4000, ASSIST_LOCALE[language].maxLength),
  });
