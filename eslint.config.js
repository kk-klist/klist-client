import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // shadcn/ui 컴포넌트는 컴포넌트와 variants 함수를 함께 export하는 것이 표준 패턴
    files: ['src/shared/components/ui/**/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
