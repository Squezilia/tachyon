import { ElysiaApp } from '@/app';
import tr from '@/i18n/tr';
import { ErrorResponseSchema } from '@/model';
import { CampaignTargetPlain, CampaignTargetPlainInputCreate } from '@database';
import Elysia from 'elysia';
import { auth, authMacro } from '@backend/lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import prisma from '@backend/lib/prisma';

export default new Elysia({ prefix: '/v1/management/campaigns/target' })
  .use(authMacro)
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

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { campaign: ['update'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      // Ensure campaign belongs to the active organization
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: params.id,
          organizationId: session.activeOrganizationId,
        },
      });

      if (!campaign) return status(404, tr.error.campaign.notFound);

      const createdTarget = await prisma.campaignTarget
        .create({
          data: {
            ...body,
            campaignId: params.id,
          },
        })
        .catch(mapPrismaError);

      if (createdTarget instanceof MappedPrismaError) {
        return status(createdTarget.status, createdTarget.response);
      }

      return createdTarget;
    },
    {
      auth: true,
      detail: {
        summary: 'Add target',
        description: 'Attach a target rule to a campaign.',
        tags: ['Campaigns', 'Targets'],
        security: [{ CookieAuth: [] }],
      },
      body: CampaignTargetPlainInputCreate,
      response: {
        ...ResponseSchemaSet,
        200: CampaignTargetPlain,
        403: ErrorResponseSchema,
      },
    }
  )
  .delete(
    ':id/:targetId',
    async ({ request: { headers }, params, status, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { campaign: ['delete'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

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
        .catch(mapPrismaError);

      if (deletedCampaignTarget instanceof MappedPrismaError) {
        return status(
          deletedCampaignTarget.status,
          deletedCampaignTarget.response
        );
      }

      return deletedCampaignTarget;
    },
    {
      auth: true,
      detail: {
        summary: 'Remove target',
        description: 'Remove a target rule from a campaign.',
        tags: ['Campaigns', 'Targets'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: CampaignTargetPlain,
        403: ErrorResponseSchema,
      },
    }
  );
