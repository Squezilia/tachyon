// apps/backend/src/app.ts
import { Elysia } from 'elysia';
import { wrap } from '@bogeychan/elysia-logger';
import swagger from '@elysiajs/swagger';
import cors from '@elysiajs/cors';

import logger from '../lib/logger';
import { auth, OpenAPI } from '../lib/auth';
import { openapi } from '@elysiajs/openapi';
import assistant from './routes/v1/assistant';
import gastro from './routes/v1/pos/gastro';
import tables from './routes/v1/pos/gastro/tables';
import orders from './routes/v1/pos/gastro/orders';
import retail from './routes/v1/pos/retail';
import sells from './routes/v1/pos/retail/sells';
import taxes from './routes/v1/management/taxes';
import campaigns from './routes/v1/management/campaigns';
import target from './routes/v1/management/campaigns/target';
import availability from './routes/v1/management/campaigns/availability';
import stocks from './routes/v1/inventory/stocks';
import products from './routes/v1/inventory/products';
import categories from './routes/v1/inventory/categories';
import { handleError } from '@backend/lib/error';

export const app = new Elysia()
  .use(handleError)
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
  .group('/v1/assistant', (app) => app.use(assistant))
  .group('/v1/pos/gastro', (app) => app.use(gastro))
  .group('/v1/pos/gastro/tables', (app) => app.use(tables))
  .group('/v1/pos/gastro/orders', (app) => app.use(orders))
  .group('/v1/pos/retail', (app) => app.use(retail))
  .group('/v1/pos/retail/sells', (app) => app.use(sells))
  .group('/v1/management/taxes', (app) => app.use(taxes))
  .group('/v1/management/campaigns', (app) => app.use(campaigns))
  .group('/v1/management/campaigns/target', (app) => app.use(target))
  .group('/v1/management/campaigns/availability', (app) =>
    app.use(availability)
  )
  .group('/v1/inventory/stocks', (app) => app.use(stocks))
  .group('/v1/inventory/products', (app) => app.use(products))
  .group('/v1/inventory/categories', (app) => app.use(categories));

export type ElysiaApp = typeof app;
