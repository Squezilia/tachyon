import { betterAuth } from 'better-auth/minimal';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';
import Elysia, { status } from 'elysia';
import {
  ac,
  accountant,
  manager,
  owner,
  staff,
  admin as adminRole,
  statement,
} from './organizations';
import prisma from '@database';
import { openAPI } from 'better-auth/plugins';
import tr from '@/i18n/tr';

type InferPermissionsFromStatement<
  T extends Record<Readonly<string>, Readonly<string[]>>,
> = {
  [k in keyof T]: T[k][number][] | undefined;
};

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:8080/', '*'],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    // admin(),
    organization({
      ac,
      roles: {
        adminRole,
        owner,
        manager,
        staff,
        accountant,
      },
    }),
    // twoFactor(),
    openAPI(),
  ],
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
  permissions: (
    permissions: Partial<InferPermissionsFromStatement<typeof statement>>
  ) => {
    return {
      beforeHandle: async ({ request: { headers }, set }) => {
        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions },
          }))
        )
          throw status(403, tr.error.organization.insufficentPermission);
      },
    };
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
