import { env } from "../../config/env.service.js";

export const GlobalErrorHandler = (err, req, res, next) => {
    const isDev = env.mood === "dev";
    const status = err.status ?? err.cause?.status ?? 500;
    const extra = err.cause?.extra;

    res.status(status).json({
        success: false,
        message: err.message ?? "Somthing went wrong!",
        ...(isDev && { stack: err.stack }),
        ...(isDev && { extra: extra }),
    });
};
