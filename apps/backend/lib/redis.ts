import { RedisClient } from 'bun';

const redis = new RedisClient();

export async function deleteBasket(basket: string) {
  const keys = await redis.smembers(basket);
  if (keys.length > 0) {
    await redis.del(...keys);
    await redis.del(basket);
  }
}

export async function addBasketKey(basket: string, key: string) {
  await redis.sadd(basket, key);
  await redis.expire(basket, 3600);
}

export default redis;
