import redis from "redis";
import { env } from "../../config/env.service.js";

export const client = redis.createClient({ url: env.redisUrl });

export const RedisConnection = async () => {
    try {
        client.on("error", (err) => {
            throw err;
        });

        await client.connect();
        console.log("Redis Database connected...");
    } catch (error) {
        console.log("Redis connection error: ", error);
    }
};
