import {
  CampaignAvailabilityPlain,
  CampaignAvailabilityPlainInputCreate,
} from '@database/prismabox/CampaignAvailability';
import Elysia from 'elysia';

export default new Elysia().model({
  availability: CampaignAvailabilityPlain,
  createAvailability: CampaignAvailabilityPlainInputCreate,
});
