import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, twoFactor } from 'better-auth/plugins';
import Elysia from 'elysia';
import organizations from './organizations';
import prisma from './prisma';
import { openAPI } from 'better-auth/plugins';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:8080/', '*'],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), organizations, twoFactor(), openAPI()],
});

export const authMacro = new Elysia({ name: 'better-auth' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session)
        return status(401, {
          error: 'Oturum Hatası',
          reason: 'Oturumunuz açık değil.',
        });

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = '/api/auth') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          // eslint-disable-next-line
          const operation = (reference[key] as any)[method];

          operation.tags = ['Better Auth'];
        }
      }

      return reference;
      // eslint-disable-next-line
    }) as Promise<any>,
  // eslint-disable-next-line
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
