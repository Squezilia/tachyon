import { createAuthClient } from 'better-auth/vue'; // make sure to import from better-auth/vue
import {
  organizationClient,
  adminClient,
  twoFactorClient,
} from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [organizationClient(), adminClient(), twoFactorClient()],
});
