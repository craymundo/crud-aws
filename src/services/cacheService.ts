import { createClient } from "redis";
import * as dotenv from 'dotenv';
dotenv.config();
const client = createClient({
  url: `redis://${process.env.CACHE_HOST}:${process.env.CACHE_PORT}`,
});

client.connect();

export const getCache = async (key: string): Promise<string | null> => {
  return await client.get(key);
};

export const setCache = async (
  key: string,
  value: any,
  ttl: number,
): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "test") {
      console.log("Skipping cache in test environment");
      return;
    }
    const options = ttl > 0 ? { EX: ttl } : undefined;
    await client.set(key, value, options);
  } catch (error) {
    console.log("ERROR REDIS SET CACHE:::", error);
  }
};
