import tr from '@/i18n/tr';
import globals from '@/globals';
import Elysia from 'elysia';
import { authMacro } from '@backend/lib/auth';
import { InterceptPrismaError, ErrorReferences } from '@backend/lib/error';
import prisma from '@database';
import model from './model';
import redis, { addBasketKey, deleteBasket } from '@backend/lib/redis';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .guard({
    auth: true,
    detail: { tags: ['Campaigns'], security: [{ CookieAuth: [] }] },
  })
  .post(
    '/',
    async ({ request: { headers }, status, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const createdCampaign = await prisma.campaign
        .create({
          data: {
            ...body,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      const basket = `org:${session.activeOrganizationId}:caches:camps`;
      await deleteBasket(basket);

      return {
        ...createdCampaign,
        value: createdCampaign.value.toString(),
      };
    },
    {
      auth: true,
      permissions: { campaign: ['create'] },
      detail: {
        summary: 'Create campaign',
        description: 'Create a new marketing campaign.',
        tags: ['Campaigns'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createCampaign',
      response: {
        ...ErrorReferences,
        200: 'campaign',
        403: 'error',
      },
    }
  )
  .get(
    '/',
    async ({ request: { headers }, status, session, query }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const cacheKey = `org:${session.activeOrganizationId}:camps:p${query.page}:m${query.max}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const transaction = await Promise.all([
        prisma.campaign.findMany({
          take: query.max,
          skip: query.max * query.page,
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
        prisma.campaign.count({
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
      ]).catch(InterceptPrismaError);

      const [campaigns, count] = transaction;

      const res = {
        data: campaigns.map((campaign) => {
          return {
            ...campaign,
            value: campaign.value.toString(),
          };
        }),
        meta: {
          max: query.max,
          page: query.page,
          total: count,
        },
      };

      await redis.set(cacheKey, JSON.stringify(res), 'EX', 30);
      const basket = `org:${session.activeOrganizationId}:caches:camps`;
      await addBasketKey(basket, cacheKey);

      return res;
    },
    {
      auth: true,
      permissions: { campaign: ['view'] },
      detail: {
        summary: 'List campaigns',
        description: 'Retrieve a paginated list of campaigns.',
        tags: ['Campaigns'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'campaignPaginated',
        403: 'error',
      },
    }
  )
  .get(
    '/:id',
    async ({ request: { headers }, status, params, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const cacheKey = `org:${session.activeOrganizationId}:camps:${params.id}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const campaign = await prisma.campaign
        .findFirst({
          where: {
            id: params.id,
            organization: {
              id: session.activeOrganizationId,
            },
          },
          include: {
            targets: true,
            availabilities: true,
          },
        })
        .catch(InterceptPrismaError);

      if (!campaign) return status(404, tr.error.campaign.notFound);

      const res = {
        ...campaign,
        value: campaign.value.toString(),
      };

      await redis.set(cacheKey, JSON.stringify(res), 'EX', 30);

      return res;
    },
    {
      auth: true,
      permissions: { campaign: ['view'] },
      detail: {
        summary: 'Get campaign',
        description:
          'Retrieve a campaign by ID, including targets and availabilities.',
        tags: ['Campaigns'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'campaignFull',
        403: 'error',
      },
    }
  )
  .patch(
    '/:id',
    async ({ request: { headers }, status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const updatedCampaign = await prisma.campaign
        .update({
          where: {
            id: params.id,
            organization: {
              id: session.activeOrganizationId,
            },
          },
          data: {
            ...body,
          },
        })
        .catch(InterceptPrismaError);

      await redis.del(`org:${session.activeOrganizationId}:camps:${params.id}`);
      const basket = `org:${session.activeOrganizationId}:caches:camps`;
      await deleteBasket(basket);

      return {
        ...updatedCampaign,
        value: updatedCampaign.value.toString(),
      };
    },
    {
      auth: true,
      permissions: { campaign: ['update'] },
      detail: {
        summary: 'Update campaign',
        description: 'Update a campaign by ID.',
        tags: ['Campaigns'],
        security: [{ CookieAuth: [] }],
      },
      body: 'updateCampaign',
      response: {
        ...ErrorReferences,
        200: 'campaign',
        403: 'error',
      },
    }
  )
  .delete(
    '/:id',
    async ({ request: { headers }, status, params, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const deletedCampaign = await prisma.campaign
        .delete({
          where: {
            id: params.id,
            organization: {
              id: session.activeOrganizationId,
            },
          },
        })
        .catch(InterceptPrismaError);

      await redis.del(`org:${session.activeOrganizationId}:camps:${params.id}`);
      const basket = `org:${session.activeOrganizationId}:caches:camps`;
      await deleteBasket(basket);

      return {
        ...deletedCampaign,
        value: deletedCampaign.value.toString(),
      };
    },
    {
      auth: true,
      permissions: { campaign: ['delete'] },
      detail: {
        summary: 'Delete campaign',
        description: 'Delete a campaign by ID.',
        tags: ['Campaigns'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'campaign',
        403: 'error',
      },
    }
  );
