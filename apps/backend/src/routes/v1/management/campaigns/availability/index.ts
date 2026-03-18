import tr from '@/i18n/tr';
import { ErrorResponseSchema } from '@/model';
import {
  CampaignAvailabilityPlain,
  CampaignAvailabilityPlainInputCreate,
} from '@database/prismabox';
import Elysia from 'elysia';
import { auth, authMacro } from '@backend/lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import prisma from '@database';

export default new Elysia()
  .use(authMacro)
  .guard({
    auth: true,
    detail: {
      tags: ['Campaigns', 'Availability'],
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

      if (!campaign)
        return status(404, {
          error: 'Not Found',
          reason: 'Campaign not found in the active organization.',
        });

      const createdAvailability = await prisma.campaignAvailability
        .create({
          data: {
            ...body,
            campaignId: params.id,
          },
        })
        .catch(mapPrismaError);

      if (createdAvailability instanceof MappedPrismaError) {
        return status(createdAvailability.status, createdAvailability.response);
      }

      return createdAvailability;
    },
    {
      auth: true,
      detail: {
        summary: 'Add availability',
        description: 'Attach an availability rule to a campaign.',
        tags: ['Campaigns', 'Availability'],
        security: [{ CookieAuth: [] }],
      },
      body: CampaignAvailabilityPlainInputCreate,
      response: {
        ...ResponseSchemaSet,
        200: CampaignAvailabilityPlain,
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
        .catch(mapPrismaError);

      if (deletedCampaignAvailability instanceof MappedPrismaError) {
        return status(
          deletedCampaignAvailability.status,
          deletedCampaignAvailability.response
        );
      }

      return deletedCampaignAvailability;
    },
    {
      auth: true,
      detail: {
        summary: 'Remove availability',
        description: 'Remove an availability rule from a campaign.',
        tags: ['Campaigns', 'Availability'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: CampaignAvailabilityPlain,
        403: ErrorResponseSchema,
      },
    }
  );
