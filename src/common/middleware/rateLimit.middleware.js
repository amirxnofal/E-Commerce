import { MINUTE, rateLimit } from "express-rate-limit";

export const authLimit = rateLimit({
    windowMs: 15 * MINUTE,
    limit: 5,
    standardHeaders: true,
    message: { message: "To many attemps,pls wait 15 minute and try again" },
});
