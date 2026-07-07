import jwt from "jsonwebtoken";
import * as error from "../responses/error.response.js";
import { env } from "../../config/env.service.js";
import { UserModel } from "../../database/models/user.model.js";

export const Auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(
                error.UnAuthorizedException({ message: "Token is required" }),
            );
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, env.secretKey);

        const user = await UserModel.findById(decoded._id);

        if (!user) {
            return next(
                error.UnAuthorizedException({ message: "Invalid session" }),
            );
        }
        if (user.status !== "active") {
            return next(
                error.ForbiddenException({ message: "Account is not active" }),
            );
        }
        if (!user.isVerified) {
            return next(
                error.ForbiddenException({ message: "Account not verified" }),
            );
        }
        req.user = user;
        next();
    } catch (err) {
        if (
            err.name === "JsonWebTokenError" ||
            err.name === "TokenExpiredError"
        ) {
            return next(
                error.UnAuthorizedException({
                    message: "Invalid or expired token",
                }),
            );
        }
        next(err);
    }
};
