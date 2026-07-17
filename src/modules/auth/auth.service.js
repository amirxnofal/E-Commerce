import { UserModel } from "../../database/models/user.model.js";
import * as e from "../../common/responses/error.response.js";
import * as hash from "../../common/utils/hash.utils.js";
import { SendEmail } from "../../common/utils/send-email.utils.js";
import { OTP } from "../../common/utils/otp.utils.js";
import { env } from "../../config/env.service.js";
import { OAuth2Client } from "google-auth-library";
import { uploadToCloudinary } from "../../common/utils/cloudinary.utils.js";
import cloudinary from "../../config/cloudinary.config.js";
import {
    GenerateToken,
    reGenerateAccessToken,
} from "../../common/utils/token.utils.js";
import {
    defaultPublicId,
    defaultSecureUrl,
} from "../../common/Constant/cloudinary.constant.js";
import * as redis from "../../database/redis/redis.service.js";
import jwt from "jsonwebtoken";

//!-----------------------------------------------------------------------------!//
//* Register Service
export const register = async (data, file) => {
    const { fName, lName, email, password, address } = data;

    const isEmailExist = await UserModel.findOne({ email });
    if (isEmailExist) e.ConflictException({ message: "Email already exist" });

    const hashedPassword = await hash.HashText(password);

    const otp = OTP();
    const hashedOTP = await hash.HashText(otp);

    const mailSend = await SendEmail({
        to: email,
        subject: "Dont share this code, just use it to verify you account",
        otp,
    });

    if (!mailSend.accepted.includes(email))
        e.InternalServerError({
            message: "Failed to send email",
        });

    const user = await UserModel.create({
        fName,
        lName,
        email,
        password: hashedPassword,
        profileImage: {
            secure_url: defaultSecureUrl,
            public_id: defaultPublicId,
        },
        address: address ? [address] : [],
    });

    await redis.set({
        key: `otp:${user._id}`,
        value: hashedOTP,
        ttl: 5 * 60,
    });

    if (file) {
        const uploadResult = await uploadToCloudinary(
            file.path,
            `users/${user._id}`,
        );

        user.profileImage = {
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        };
    }

    await user.save();
    return { user };
};

//!-----------------------------------------------------------------------------!//
//* verify email Service
export const verifyEmail = async (data) => {
    const { email, otp } = data;

    const isExist = await UserModel.findOne({ email });
    if (!isExist) e.BadRequestException({ message: "Email not found" });

    const hashedOTP = await redis.get(`otp:${isExist._id}`);

    const isMatched = await hash.CompareText(otp, hashedOTP);
    if (!isMatched) e.BadRequestException({ message: "Invalid otp" });

    isExist.isVerified = true;
    isExist.status = "active";
    redis.del(`otp:${isExist._id}`);

    await isExist.save();

    return isExist;
};

//!-----------------------------------------------------------------------------!//
//* Login Service
export const login = async (data, host) => {
    const { email, password } = data;

    const isExist = await UserModel.findOne({ email });
    if (!isExist) e.BadRequestException({ message: "Email not found" });

    const isMatched = await hash.CompareText(password, isExist.password);
    if (!isMatched)
        e.BadRequestException({ message: "Invalid email or password" });

    if (isExist.isVerified === false)
        e.BadRequestException({ message: "Cant login before verify email" });

    if (isExist.status !== "active")
        e.ForbiddenException({
            message: "Account is inactive or deleted",
        });

    const token = await GenerateToken(isExist._id, isExist.role, host);

    return { token, isExist };
};

//!-----------------------------------------------------------------------------!//
//* Google login Service
export const googleLogin = async (data, host) => {
    const { idToken } = data;

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: env.googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified)
        e.BadRequestException({ message: "Google email not verified" });

    let user = await UserModel.findOne({ email: payload.email });
    let isNewUser = false;

    if (!user) {
        user = await UserModel.create({
            fName: payload.given_name || "User",
            lName: payload.family_name || "",
            email: payload.email,
            isVerified: payload.email_verified,
            profileImage: {
                secure_url: payload.picture,
                public_id: `google_${payload.sub}`,
            },
            authProvider: "google",
            status: "active",
        });
        isNewUser = true;
    }

    const token = await GenerateToken(user._id, user.role, host);

    return { token, user, isNewUser };
};

//!-----------------------------------------------------------------------------!//
//* refresh token Service
export const refreshToken = async (refreshToken, host) => {
    const token = await reGenerateAccessToken(refreshToken, host);
    return { token };
};

//!-----------------------------------------------------------------------------!//
//* Forget password Service
export const forgotPassword = async (data) => {
    const { email } = data;

    const isExist = await UserModel.findOne({ email });
    if (!isExist) return { data: "If the email exists, an OTP has been sent" };

    const otp = OTP();
    const hashedOtp = await hash.HashText(otp);

    const mail = await SendEmail({
        to: email,
        subject: "Use it to reset pasword",
        otp,
    });

    if (!mail.accepted.includes(email))
        e.ForbiddenException({ message: "Falied send OTP" });

    await redis.set({
        key: `otp:${isExist._id}`,
        value: hashedOtp,
        ttl: 5 * 60,
    });

    return { data: "otp sent ,check email" };
};

//!-----------------------------------------------------------------------------!//
//* Reset password Service
export const resetPassword = async (data) => {
    const { email, newPassword, otp } = data;

    const isExist = await UserModel.findOne({ email });
    if (!isExist) e.NotFoundException({ message: "Email not found!" });

    const hashedOTP = await redis.get(`otp:${isExist._id}`);

    const isMatched = await hash.CompareText(otp, hashedOTP);
    if (!isMatched)
        e.BadRequestException({ message: "OTP expired or invalid" });

    const hashedPassword = await hash.HashText(newPassword);

    isExist.password = hashedPassword;
    await redis.del(`otp:${isExist._id}`);

    await isExist.save();

    return { data: "Password reset" };
};

//!-----------------------------------------------------------------------------!//
//* Resend OTP Service
export const resendOtp = async (email) => {
    const user = await UserModel.findOne({ email });
    if (!user || user.status === "deleted")
        e.NotFoundException({ message: "User not found" });

    if (user.isVerified)
        e.BadRequestException({ message: "Email is already verified" });

    const otp = OTP();
    const hashedOTP = await hash.HashText(otp);

    const mailSend = await SendEmail({
        to: email,
        subject: "Dont share this code, just use it to verify you account",
        otp,
    });
    if (!mailSend.accepted.includes(email))
        e.BadRequestException({ message: "Failed to send OTP" });

    await redis.set({
        key: `otp:${user._id}`,
        value: hashedOTP,
        ttl: 5 * 60,
    });

    return { data: "OTP Sent" };
};

//!-----------------------------------------------------------------------------!//
//* Logout Service
export const logout = async (userId, req) => {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(" ")[1];
    const { refreshToken } = req.body;

    const user = await UserModel.findById(userId);
    if (!user || user.status === "deleted")
        e.NotFoundException({ message: "User not found" });

    const now = Math.floor(Date.now() / 1000);

    // Revoke access token
    const decodedAccess = jwt.decode(accessToken);
    if (decodedAccess?.jti && decodedAccess?.exp) {
        const ttl = decodedAccess.exp - now;
        if (ttl > 0) {
            await redis.set({
                key: `revoked:access:${decodedAccess.jti}`,
                value: 1,
                ttl,
            });
        }
    }

    // Revoke refresh token
    const decodedRefresh = jwt.decode(refreshToken);
    if (decodedRefresh?.jti && decodedRefresh?.exp) {
        const ttl = decodedRefresh.exp - now;
        if (ttl > 0) {
            await redis.set({
                key: `revoked:refresh:${decodedRefresh.jti}`,
                value: 1,
                ttl,
            });
        }
    }

    return { data: "Logged out" };
};
