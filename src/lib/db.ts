import { Redis } from "@upstash/redis";

const redisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const db = new Redis({
  url: redisRestUrl,
  token: redisRestToken,
});
