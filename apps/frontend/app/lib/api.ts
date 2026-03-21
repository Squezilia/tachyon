import type { ElysiaApp } from '@backend';
import { treaty } from '@elysiajs/eden';

const client = treaty<ElysiaApp>('http://localhost:3000', {
  fetch: {
    credentials: 'include',
  },
  throwHttpError: true,
});

export default client;
