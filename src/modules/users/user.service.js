import { UserModel } from "../../database/models/user.model.js";
import * as e from "../../common/responses/error.response.js";
import * as hash from "../../common/utils/hash.utils.js";
import { env } from "../../config/env.service.js";
import { uploadToCloudinary } from "../../common/utils/cloudinary.utils.js";
import { defaultPublicId } from "../../common/Constant/cloudinary.constant.js";
import cloudinary from "../../config/cloudinary.config.js";
import jwt from "jsonwebtoken";
import * as redis from "../../database/redis/redis.service.js";

//!-----------------------------------------------------------------!//

//* Get Profile Service
export const retriveUser = async (user) => {
    return { user };
};
//!-----------------------------------------------------------------!//

//* Update user data Service
export const updateUserData = async (user, data) => {
    const { fName, lName, email, address } = data;

    if (fName) user.fName = fName;
    if (lName) user.lName = lName;
    if (address) user.address.push(address);
    if (email && email !== user.email) {
        const isEmailExist = await UserModel.findOne({ email });
        if (isEmailExist)
            e.ConflictException({ message: "Email already exist" });
        user.email = email;
    }

    await user.save();
    return { user };
};
//!-----------------------------------------------------------------!//

//* Update user image Service
export const updateUserImage = async (user, file) => {
    if (!file) e.BadRequestException({ message: "Must upload image" });

    const oldImage = {
        public_id: user.profileImage.public_id,
        secure_url: user.profileImage.secure_url,
    };

    const uploadResult = await uploadToCloudinary(
        file.path,
        `users/${user._id}/profileImages`,
    );

    user.profileImage = {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
    };

    await user.save();

    if (oldImage.public_id !== defaultPublicId)
        await cloudinary.uploader.destroy(oldImage.public_id);

    return { user };
};
//!-----------------------------------------------------------------!//

//* Update user password Service
export const updateUserPassword = async (userId, data) => {
    const { oldPassword, newPassword } = data;

    const user = await UserModel.findById(userId);
    if (!user || user.status !== "active")
        e.NotFoundException({ message: "User not found" });

    const isMatched = await hash.CompareText(oldPassword, user.password);
    if (!isMatched) e.BadRequestException({ message: "Wrong password" });

    const hashedPassword = await hash.HashText(newPassword);

    user.password = hashedPassword;

    await user.save();

    return { user };
};
//!-----------------------------------------------------------------!//
//* delete user Service
export const deleteUser = async (userId, password, req) => {
    const user = await UserModel.findById(userId);
    if (!user || user.status !== "active")
        throw new e.NotFoundException({ message: "User not found" });

    const isMatched = await hash.CompareText(password, user.password);
    if (!isMatched)
        throw new e.BadRequestException({ message: "Wrong password" });

    user.status = "deleted";
    user.deletedAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(" ")[1];
    const { refreshToken } = req.body;

    const now = Math.floor(Date.now() / 1000);

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

    return { user };
};

//!-----------------------------------------------------------------!//
//* Get all users Service
export const retriveAllUsers = async () => {
    const users = await UserModel.find({ status: "active" });
    if (users.length === 0) e.NotFoundException({ message: "No user found" });

    return { users };
};
//!-----------------------------------------------------------------!//
//* Change user role Service
export const changeRole = async (userId, data) => {
    const { role } = data;

    const user = await UserModel.findById(userId);
    if (!user) throw e.NotFoundException({ message: "User not found" });

    user.role = role;
    await user.save();

    return { user };
};
//!-----------------------------------------------------------------!//
//* Change user status Service
export const changeStatus = async (userId, data) => {
    const { status } = data;

    const user = await UserModel.findById(userId);
    if (!user) throw e.NotFoundException({ message: "User not found" });

    user.status = status;
    await user.save();

    return { user };
};
