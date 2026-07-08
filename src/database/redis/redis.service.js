import { client } from "./redis.js";

export const get = async (key) => {
    return await client.get(key);
};

export const set = async ({ key, value, ttl }) => {
    return await client.set(key, value, { EX: ttl });
};

export const mGet = async (...key) => {
    return await client.mGet(key);
};

export const exists = async (key) => {
    return await client.exists(key);
};

export const ttl = async (key) => {
    return await client.ttl(key);
};

export const del = async (key) => {
    return await client.del(key);
};

export const createRevokeToken = async (userId, token) => {
    return `RevokeToken: ${userId}:${token}`;
};
