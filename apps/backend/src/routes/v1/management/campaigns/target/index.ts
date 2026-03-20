import tr from '@/i18n/tr';
import globals from '@/globals';
import Elysia from 'elysia';
import { authMacro } from '@backend/lib/auth';
import {
  catchPrismaError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import prisma from '@database';
import model from './model';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .use(catchPrismaError)
  .guard({
    auth: true,
    detail: {
      tags: ['Campaigns', 'Targets'],
      security: [{ CookieAuth: [] }],
    },
  })
  .post(
    ':id',
    async ({ request: { headers }, session, params, body, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const campaign = await prisma.campaign
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!campaign) return status(404, tr.error.campaign.notFound);

      const createdTarget = await prisma.campaignTarget
        .create({
          data: {
            ...body,
            campaignId: params.id,
          },
        })
        .catch(InterceptPrismaError);

      return createdTarget;
    },
    {
      auth: true,
      permissions: { campaign: ['update'] },
      detail: {
        summary: 'Add target',
        description: 'Attach a target rule to a campaign.',
        tags: ['Campaigns', 'Targets'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createTarget',
      response: {
        ...ErrorReferences,
        200: 'target',
        403: 'error',
      },
    }
  )
  .delete(
    ':id/:targetId',
    async ({ request: { headers }, params, status, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const deletedCampaignTarget = await prisma.campaignTarget
        .delete({
          where: {
            id: params.targetId,
            campaign: {
              id: params.id,
              organizationId: session.activeOrganizationId,
            },
          },
        })
        .catch(InterceptPrismaError);

      return deletedCampaignTarget;
    },
    {
      auth: true,
      permissions: { campaign: ['delete'] },
      detail: {
        summary: 'Remove target',
        description: 'Remove a target rule from a campaign.',
        tags: ['Campaigns', 'Targets'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'target',
        403: 'error',
      },
    }
  );
