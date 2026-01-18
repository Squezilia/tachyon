import { betterAuth, InferSession } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, twoFactor } from 'better-auth/plugins';
import Elysia, { Context, StatusMap } from 'elysia';
import { AccessControl, Statements } from 'better-auth/plugins/access';
import organizations, { statement } from './organizations';
import { InferOrganizationRolesFromOption } from 'better-auth/plugins/organization';
import prisma from './prisma';
import tr from '@/i18n/tr';
import { ResponseError } from '@/i18n';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:8080/', '*'],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), organizations, twoFactor()],
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

type FromDefinitionToStatement<
  T extends Readonly<Record<string, Readonly<string[]>>>,
> = {
  [k in keyof T]?: T[k][number][] | undefined;
};

type Values<T> = T[keyof T];

export async function validateOrganizationPermission(
  headers: Headers,
  session: InferSession<typeof auth>,
  asd: FromDefinitionToStatement<typeof statement>
): Promise<[400 | 403, ResponseError] | undefined> {
  if (!session.activeOrganizationId)
    return [400, tr.error.organization.noActive];

  if (
    !(await auth.api.hasPermission({
      headers,
      body: { permissions: asd },
    }))
  )
    return [403, tr.error.organization.insufficentPermission];
}
