import type { App } from '@backend';
import { treaty } from '@elysiajs/eden';

const client = treaty<App>('http://localhost:3000', {
  fetch: {
    credentials: 'include',
  },
});

export default client;
