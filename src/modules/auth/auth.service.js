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
        return e.InternalServerError({
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

        const oldImage = {
            secure_url: user.profileImage.secure_url,
            public_id: user.profileImage.public_id,
        };

        user.profileImage = {
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        };

        if (oldImage.public_id != defaultPublicId) {
            await cloudinary.uploader.destroy(oldImage.public_id);
        }
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

    const isMatched = await hash.CompareText(otp, isExist.otp);
    if (!isMatched) e.BadRequestException({ message: "Wrong OTP" });

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
            message: "Account is inactive",
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

    if (!user) {
        user = await UserModel.create({
            fName: payload.given_name || "User",
            lName: payload.family_name || "",
            email: payload.email,
            isVerified: payload.email_verified,
            profileImage: payload.picture,
            authProvider: "google",
            status: "active",
        });
    }

    const token = await GenerateToken(user._id, user.role, host);

    return { token, user };
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
    if (!isExist) e.NotFoundException({ message: "Email not found!" });

    const otp = OTP();
    const hashedOtp = await hash.HashText(otp);

    const mail = await SendEmail({
        to: email,
        subject: "Use it to reset pasword",
        otp,
    });
    if (!mail.accepted.includes(email))
        e.ForbiddenException({ message: "Falied send OTP" });
    console.log("From Forget Password Service: ", otp);
    isExist.otp = hashedOtp;
    await isExist.save();

    return { data: "otp sent ,check email" };
};

//!-----------------------------------------------------------------------------!//
//* Reset password Service
export const resetPassword = async (data) => {
    const { email, newPassword, otp } = data;

    const isExist = await UserModel.findOne({ email });
    if (!isExist) e.NotFoundException({ message: "Email not found!" });

    const isMatched = await hash.CompareText(otp, isExist.otp);
    if (!isMatched) e.BadRequestException({ message: "Invalid otp!" });

    const hashedPassword = await hash.HashText(newPassword);

    isExist.password = hashedPassword;
    isExist.otp = undefined;

    await isExist.save();

    return { data: "Password reset" };
};
