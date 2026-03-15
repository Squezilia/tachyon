// apps/backend/src/app.ts
import { Elysia } from 'elysia';
import { wrap } from '@bogeychan/elysia-logger';
import swagger from '@elysiajs/swagger';
import cors from '@elysiajs/cors';

import logger from '../lib/logger';
import { auth, OpenAPI } from '../lib/auth';

import hospitality from './routes/v1/pos/gastro';
import retail from './routes/v1/pos/retail';
import taxes from './routes/v1/management/taxes';
import target from './routes/v1/management/campaigns/target';
import availability from './routes/v1/management/campaigns/availability';
import campaigns from './routes/v1/management/campaigns';
import categories from './routes/v1/inventory/categories';
import products from './routes/v1/inventory/products';
import stocks from './routes/v1/inventory/stocks';
import assistant from './routes/v1/assistant';
import { openapi } from '@elysiajs/openapi';

export const app = new Elysia()
  .use(wrap(logger))
  .use(
    cors({
      origin: 'http://localhost:8080',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .use(
    swagger({
      autoDarkMode: true,
      documentation: {
        info: {
          title: 'Tachyon Backend',
          description:
            'Fast, reliable, flexible and easy-to-use Retail/Cafe POS system.',
          version: '0.0.1',
        },
        components: {
          securitySchemes: {
            CookieAuth: {
              type: 'apiKey',
              in: 'cookie',
              name: 'auth_session',
              description:
                'Session cookie set by BetterAuth. Requests from the app include credentials automatically.',
            },
          },
        },
      },
    })
  )
  .mount(auth.handler)
  .get('/', () => 'Hello Tachyon!!', {
    detail: {
      summary: 'Healthcheck',
      description: 'Simple liveness probe for the Tachyon API.',
      tags: ['System'],
    },
  })
  .group('/v1', (app) =>
    app
      .group('/assistant', (app) => app.use(assistant()))
      .group('/inventory', (app) =>
        app.use(products()).use(categories()).use(stocks())
      )
      .group('/management', (app) =>
        app.use(taxes()).use(campaigns()).use(availability()).use(target())
      )
      .group('/pos', (app) => app.use(retail()).use(hospitality()))
  );

export type App = typeof app;
