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
        rootDir: '../',
        paths: {
          '@backend': ['../../backend/dist/src/app.d.ts'],
          '@backend/*': ['../../backend/dist/src/*'],
          '@backend/lib/*': ['../../backend/dist/lib/*'],

          '@database': ['../../../packages/database/dist'],
          '@database/*': ['../../../packages/database/dist/*'],
          '@database/prismabox': [
            '../../../packages/database/dist/prismabox/barrel',
          ],
          '@database/prisma': ['../../../packages/database/dist/prisma/client'],
        },
      },
      exclude: ['../../backend/dist/**/*'],
      include: ['../app/**/*'],
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: {
        lang: 'tr',
      },
    },
  },

  experimental: {
    typedPages: true,
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'shadcn-nuxt',
    'motion-v/nuxt',
    '@nuxt/hints',
  ],

  css: ['~/assets/css/tailwind.css'],
  vite: {
    optimizeDeps: {
      include: [
        '@vee-validate/zod',
        'vee-validate',
        'zod',
        'vaul-vue',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/core',
        'howler', // CJS
        '@huggingface/transformers',
        'lucide-vue-next',
        'vue-sonner',
        'clsx',
        'tailwind-merge',
        'better-auth/vue',
        'better-auth/client/plugins',
        '@elysiajs/eden',
        '@tanstack/vue-table',
        'class-variance-authority',
        'reka-ui',
        'markdown-it',
        '@vscode/markdown-it-katex', // CJS
        'markdown-it-sub',
        'markdown-it-footnote',
        'markdown-it-task-lists', // CJS
        'markdown-it-emoji',
        'markdown-it-anchor',
        'markdown-it-container',
      ],
    },
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

  icon: {
    mode: 'svg',
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
