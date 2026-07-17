import express from "express";
import path from "path";
import cors from "cors";

import { fileURLToPath } from "url";
import { env } from "./config/env.service.js";
import { GlobalErrorHandler } from "./common/errors/error.handler.js";
import { DatabaseConnection } from "./database/connection.js";

import authRouter from "./modules/auth/auth.route.js";
import userRouter from "./modules/users/user.route.js";
import productRouter from "./modules/products/products.route.js";
import categoryRouter from "./modules/categories/category.route.js";
import cartRouter from "./modules/cart/cart.route.js";
import { RedisConnection } from "./database/redis/redis.js";
import * as R from "./database/redis/redis.service.js";

export const bootstrap = async () => {
    const app = express();
    app.use(express.json());

    //* Database Connection
    await DatabaseConnection();
    await RedisConnection();

    //* Check Server health
    app.get("/check-health", (req, res) => {
        res.json({ message: "Server is healthy..." });
    });

    //? For google login unblock
    app.use(cors({ origin: "http://localhost:5173", credentials: true }));

    //* App routes
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/products", productRouter);
    app.use("/categories", categoryRouter);
    app.use("/cart", cartRouter);

    //* To can open Image in browser
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

    //* Dummy endPoint
    app.use("{*dummy}", (req, res) => {
        res.json({ message: "url not found" });
    });

    //! Global error handling
    app.use(GlobalErrorHandler);

    app.listen(env.port, () => {
        console.log("Server is running...");
    });
};
