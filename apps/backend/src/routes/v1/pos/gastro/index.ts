import Elysia from 'elysia';
import { authMacro } from 'lib/auth';

export default () =>
  new Elysia({ prefix: '/gastro' })
    .use(authMacro)
    .post('/order', () => {})
    .post('/update', () => {})
    .post('/close', () => {})
    .post('/refund', () => {});
