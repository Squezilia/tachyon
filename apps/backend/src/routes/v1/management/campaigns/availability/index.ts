import tr from '@/i18n/tr';
import globals from '@/globals';
import Elysia from 'elysia';
import { authMacro } from '@backend/lib/auth';
import {
  handleError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import prisma from '@database';
import model from './model';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .guard({
    auth: true,
    detail: {
      tags: ['Campaigns', 'Availability'],
      security: [{ CookieAuth: [] }],
    },
  })
  .post(
    ':id',
    async ({ session, params, body, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      // Ensure campaign belongs to the active organization
      const campaign = await prisma.campaign
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!campaign) return status(404, tr.error.campaign.notFound);

      const createdAvailability = await prisma.campaignAvailability
        .create({
          data: {
            ...body,
            campaignId: params.id,
          },
        })
        .catch(InterceptPrismaError);

      return createdAvailability;
    },
    {
      auth: true,
      permissions: { campaign: ['update'] },
      detail: {
        summary: 'Add availability',
        description: 'Attach an availability rule to a campaign.',
        tags: ['Campaigns', 'Availability'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createAvailability',
      response: {
        ...ErrorReferences,
        200: 'availability',
        403: 'error',
      },
    }
  )
  .delete(
    ':id/:targetId',
    async ({ request: { headers }, params, status, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const deletedCampaignAvailability = await prisma.campaignAvailability
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

      return deletedCampaignAvailability;
    },
    {
      auth: true,
      permissions: { campaign: ['delete'] },
      detail: {
        summary: 'Remove availability',
        description: 'Remove an availability rule from a campaign.',
        tags: ['Campaigns', 'Availability'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'availability',
        403: 'error',
      },
    }
  );
