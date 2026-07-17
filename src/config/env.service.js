import dotenv from "dotenv";

dotenv.config({ path: "./src/config/.env" });

const port = process.env.PORT;
const serverUrl = process.env.SERVER_URI;
const mongoose_url = process.env.MONGOOSE_URI;
const mood = process.env.MOOD;
const secretKey = process.env.SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;
const saltRound = Number(process.env.SALT_ROUND);
const googleAppEmail = process.env.GOOGLE_APP_EMAIL;
const googleAppPassword = process.env.GOOGLE_APP_PASSWORD;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const redisUrl = process.env.REDIS_URL;

const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

export const env = {
    port,
    mongoose_url,
    mood,
    secretKey,
    refreshSecretKey,
    saltRound,
    googleAppEmail,
    googleAppPassword,
    googleClientId,
    serverUrl,
    redisUrl,
    cloudinaryName,
    cloudinaryApiKey,
    cloudinaryApiSecret,
};
