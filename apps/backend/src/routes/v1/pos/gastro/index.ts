import Elysia from 'elysia';
import { authMacro } from 'lib/auth';
import orders from './orders';

export default () =>
  new Elysia({ prefix: '/gastro' })
    .use(authMacro)
    .post('/order', () => {})
    .post('/update', () => {})
    .post('/close', () => {})
    .post('/refund', () => {})
    .use(orders);
