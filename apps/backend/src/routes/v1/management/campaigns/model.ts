import { PaginateResponse } from '@/globals';
import {
  CampaignPlain,
  CampaignPlainInputCreate,
  CampaignPlainInputUpdate,
} from '@database/prismabox/Campaign';
import { CampaignAvailabilityPlain } from '@database/prismabox/CampaignAvailability';
import { CampaignTargetPlain } from '@database/prismabox/CampaignTarget';
import Elysia, { t } from 'elysia';

export default new Elysia().model({
  campaign: CampaignPlain,
  createCampaign: CampaignPlainInputCreate,
  updateCampaign: CampaignPlainInputUpdate,
  campaignPaginated: PaginateResponse(CampaignPlain),
  campaignFull: t.Intersect([
    CampaignPlain,
    t.Object({
      targets: t.Array(CampaignTargetPlain),
      availabilities: t.Array(CampaignAvailabilityPlain),
    }),
  ]),
});
