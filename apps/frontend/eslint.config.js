// @ts-check
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Your custom configs here

  eslintConfigPrettier,
  {
    ignores: [
      'app/components/ui/**/*',
      'app/lib/shadcn/**/*',
      'node_modules/**/*',
      '*.config.js',
      'dist/*',
      '.yarn',
    ],
  }
);
