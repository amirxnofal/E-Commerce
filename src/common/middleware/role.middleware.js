import { UserModel } from "../../database/models/user.model.js";
import * as error from "../responses/error.response.js";

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                error.ForbiddenException({
                    message: "Unauthorized to do this",
                }),
            );
        }
        next();
    };
};