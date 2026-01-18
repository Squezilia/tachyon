import tr from "@/i18n/tr";
import {
	ErrorResponseSchema,
	PaginationQuery,
	ResponsePaginate,
} from "@/model";
import {
	CampaignAvailabilityPlain,
	CampaignPlain,
	CampaignPlainInputCreate,
	CampaignPlainInputUpdate,
	CampaignTargetPlain,
} from "@database";
import Elysia, { t } from "elysia";
import { auth, authMacro } from "lib/auth";
import {
	MappedPrismaError,
	mapPrismaError,
	ResponseSchemaSet,
} from "lib/error";
import prisma from "lib/prisma";

export default () =>
	new Elysia({ prefix: "/campaigns" })
		.use(authMacro)
		.guard({
			auth: true,
			detail: { tags: ["Campaigns"], security: [{ CookieAuth: [] }] },
		})
		.post(
			"/create",
			async ({ request: { headers }, status, body, session }) => {
				if (!session.activeOrganizationId)
					return status(400, tr.error.organization.noActive);

				if (
					!(await auth.api.hasPermission({
						headers,
						body: { permissions: { campaign: ["create"] } },
					}))
				)
					return status(403, tr.error.organization.insufficentPermission);

				const createdCampaign = await prisma.campaign
					.create({
						data: {
							...body,
							organizationId: session.activeOrganizationId,
						},
					})
					.catch(mapPrismaError);

				if (createdCampaign instanceof MappedPrismaError) {
					return status(createdCampaign.status, createdCampaign.response);
				}

				return {
					...createdCampaign,
					value: createdCampaign.value.toString(),
				};
			},
			{
				auth: true,
				detail: {
					summary: "Create campaign",
					description: "Create a new marketing campaign.",
					tags: ["Campaigns"],
					security: [{ CookieAuth: [] }],
				},
				body: CampaignPlainInputCreate,
				response: {
					...ResponseSchemaSet,
					200: CampaignPlain,
					403: ErrorResponseSchema,
				},
			}
		)
		.get(
			"/get",
			async ({ request: { headers }, status, session, query }) => {
				if (!session.activeOrganizationId)
					return status(400, tr.error.organization.noActive);

				if (
					!(await auth.api.hasPermission({
						headers,
						body: { permissions: { campaign: ["view"] } },
					}))
				)
					return status(403, tr.error.organization.insufficentPermission);

				const transaction = await prisma
					.$transaction([
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
					])
					.catch(mapPrismaError);

				if (transaction instanceof MappedPrismaError) {
					return status(transaction.status, transaction.response);
				}

				const [campaigns, count] = transaction;

				return {
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
			},
			{
				auth: true,
				detail: {
					summary: "List campaigns",
					description: "Retrieve a paginated list of campaigns.",
					tags: ["Campaigns"],
					security: [{ CookieAuth: [] }],
				},
				query: PaginationQuery,
				response: {
					...ResponseSchemaSet,
					200: ResponsePaginate(CampaignPlain),
					403: ErrorResponseSchema,
				},
			}
		)
		.get(
			"/get/:id",
			async ({ request: { headers }, status, params, session }) => {
				if (!session.activeOrganizationId)
					return status(400, tr.error.organization.noActive);

				if (
					!(await auth.api.hasPermission({
						headers,
						body: { permissions: { campaign: ["view"] } },
					}))
				)
					return status(403, tr.error.organization.insufficentPermission);

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
					.catch(mapPrismaError);

				if (campaign instanceof MappedPrismaError) {
					return status(campaign.status, campaign.response);
				}

				if (!campaign) return status(404, tr.error.campaign.notFound);

				return {
					...campaign,
					value: campaign.value.toString(),
				};
			},
			{
				auth: true,
				detail: {
					summary: "Get campaign",
					description:
						"Retrieve a campaign by ID, including targets and availabilities.",
					tags: ["Campaigns"],
					security: [{ CookieAuth: [] }],
				},
				response: {
					...ResponseSchemaSet,
					200: t.Intersect([
						CampaignPlain,
						t.Object({
							targets: t.Array(CampaignTargetPlain),
							availabilities: t.Array(CampaignAvailabilityPlain),
						}),
					]),
					403: ErrorResponseSchema,
				},
			}
		)
		.patch(
			"/update/:id",
			async ({ request: { headers }, status, params, body, session }) => {
				if (!session.activeOrganizationId)
					return status(400, tr.error.organization.noActive);

				if (
					!(await auth.api.hasPermission({
						headers,
						body: { permissions: { campaign: ["update"] } },
					}))
				)
					return status(403, tr.error.organization.insufficentPermission);

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
					.catch(mapPrismaError);

				if (updatedCampaign instanceof MappedPrismaError)
					return status(updatedCampaign.status, updatedCampaign.response);

				return {
					...updatedCampaign,
					value: updatedCampaign.value.toString(),
				};
			},
			{
				auth: true,
				detail: {
					summary: "Update campaign",
					description: "Update a campaign by ID.",
					tags: ["Campaigns"],
					security: [{ CookieAuth: [] }],
				},
				body: CampaignPlainInputUpdate,
				response: {
					...ResponseSchemaSet,
					200: CampaignPlain,
					403: ErrorResponseSchema,
				},
			}
		)
		.delete(
			"/delete/:id",
			async ({ request: { headers }, status, params, session }) => {
				if (!session.activeOrganizationId)
					return status(400, tr.error.organization.noActive);

				if (
					!(await auth.api.hasPermission({
						headers,
						body: { permissions: { campaign: ["delete"] } },
					}))
				)
					return status(403, tr.error.organization.insufficentPermission);

				const deletedCampaign = await prisma.campaign
					.delete({
						where: {
							id: params.id,
							organization: {
								id: session.activeOrganizationId,
							},
						},
					})
					.catch(mapPrismaError);

				if (deletedCampaign instanceof MappedPrismaError)
					return status(deletedCampaign.status, deletedCampaign.response);

				return {
					...deletedCampaign,
					value: deletedCampaign.value.toString(),
				};
			},
			{
				auth: true,
				detail: {
					summary: "Delete campaign",
					description: "Delete a campaign by ID.",
					tags: ["Campaigns"],
					security: [{ CookieAuth: [] }],
				},
				response: {
					...ResponseSchemaSet,
					200: CampaignPlain,
					403: ErrorResponseSchema,
				},
			}
		);
