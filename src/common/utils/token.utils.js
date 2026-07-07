import jwt from "jsonwebtoken";
import { env } from "../../config/env.service.js";
import * as error from "../responses/error.response.js";

export const GenerateToken = (userId, role, host) => {
    const accessToken = jwt.sign({ _id: userId, role }, env.secretKey, {
        expiresIn: "1d",
        issuer: host,
    });
    const refreshToken = jwt.sign({ _id: userId, role }, env.refreshSecretKey, {
        expiresIn: "1y",
        issuer: host,
    });
    return { accessToken, refreshToken };
};

export const reGenerateAccessToken = (refreshToken, host) => {
    try {
        if (!refreshToken || !refreshToken.startsWith("Bearer "))
            error.UnAuthorizedException();

        const token = refreshToken.split(" ")[1];

        const decode = jwt.verify(token, env.refreshSecretKey);
        if (!decode) error.UnAuthorizedException();

        return jwt.sign(
            {
                _id: decode._id,
                role: decode.role,
            },
            env.secretKey,
            {
                expiresIn: "1d",
                issuer: host,
            },
        );
    } catch (err) {
        error.UnAuthorizedException({ message: err.message });
    }
};
