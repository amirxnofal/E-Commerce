import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.service.js";

cloudinary.config({
    cloud_name: env.cloudinaryName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
});

export default cloudinary;
