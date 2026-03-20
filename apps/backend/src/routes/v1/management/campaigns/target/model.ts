import {
  CampaignTargetPlain,
  CampaignTargetPlainInputCreate,
} from '@database/prismabox/CampaignTarget';
import Elysia from 'elysia';

export default new Elysia().model({
  target: CampaignTargetPlain,
  createTarget: CampaignTargetPlainInputCreate,
});
