import tailwindcss from '@tailwindcss/vite';
// import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  debug: false,

  typescript: {
    tsConfig: {
      compilerOptions: {
        strict: true,
        allowJs: true,
        isolatedModules: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        esModuleInterop: true,
        allowImportingTsExtensions: false,
        preserveSymlinks: false,
        verbatimModuleSyntax: false,
        outDir: 'dist',
        skipLibCheck: true,

        baseUrl: '.',
        paths: {
          '@backend': ['../../backend/src/app.ts'],
          '@backend/*': ['../../backend/src/*'],

          '@database': ['../../../packages/database/src/index.ts'],
          '@database/*': ['../../../packages/database/src/*'],
          '@database/generated/*': [
            '../../../packages/database/src/generated/*',
          ],
        },
      },
    },
  },

  runtimeConfig: {
    app: {
      apiBaseUrl: 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'tr',
      },
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'shadcn-nuxt',
    'motion-v/nuxt',
  ],

  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tsconfigPaths(), tailwindcss()],
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './app/components/ui',
  },

  fonts: {
    provider: 'google',
    families: [
      {
        name: 'DM Sans',
        provider: 'google',
        fallbacks: [
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
        ],
        weights: ['300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'Geist',
        provider: 'google',
        fallbacks: [
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
        ],
        weights: ['300', '400', '500', '600', '700', '800', '900'],
      },
    ],
  },
});
