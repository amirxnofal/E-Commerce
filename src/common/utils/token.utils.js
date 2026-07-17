import jwt from "jsonwebtoken";
import { env } from "../../config/env.service.js";
import * as error from "../responses/error.response.js";
import { randomUUID } from "crypto";
import { get } from "../../database/redis/redis.service.js";

export const GenerateToken = (userId, role, host) => {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const accessToken = jwt.sign(
        { _id: userId, role, jti: accessJti },
        env.secretKey,
        {
            expiresIn: "15m",
            issuer: host,
        },
    );
    const refreshToken = jwt.sign(
        { _id: userId, role, jti: refreshJti },
        env.refreshSecretKey,
        {
            expiresIn: "1y",
            issuer: host,
        },
    );
    return { accessToken, refreshToken };
};

export const reGenerateAccessToken = async (refreshToken, host) => {
    try {
        if (!refreshToken || !refreshToken.startsWith("Bearer "))
            error.UnAuthorizedException();

        const token = refreshToken.split(" ")[1];
        const decode = jwt.verify(token, env.refreshSecretKey);
        if (!decode) error.UnAuthorizedException();

        const isRevoked = await get(`revoked:refresh:${decode.jti}`);
        if (isRevoked)
            error.UnAuthorizedException({
                message: "Refresh token has been revoked",
            });

        const newAccessJti = randomUUID();

        return jwt.sign(
            {
                _id: decode._id,
                role: decode.role,
                jti: newAccessJti,
            },
            env.secretKey,
            {
                expiresIn: "15m",
                issuer: host,
            },
        );
    } catch (err) {
        error.UnAuthorizedException({ message: err.message });
    }
};
