import mongoose from "mongoose";
import { env } from "../config/env.service.js";

export const DatabaseConnection = async () => {
    try {
        const connect = await mongoose.connect(env.mongoose_url);
        console.log("Database connected...");
    } catch (error) {
        console.log("Database Error : ", error);
    }
};
