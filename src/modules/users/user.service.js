import { UserModel } from "../../database/models/user.model.js";
import * as e from "../../common/responses/error.response.js";
import * as hash from "../../common/utils/hash.utils.js";
import { env } from "../../config/env.service.js";

//!-----------------------------------------------------------------!//
//* Get user Service
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
    user.profileImage = file
        ? `${env.serverUrl}/${file.path}`
        : user.profileImage;

    await user.save();

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
    if (!isMatched) e.ConflictException({ message: "Wrong old password" });

    const hashedPassword = await hash.HashText(newPassword);

    user.password = hashedPassword;

    await user.save();

    return { user };
};
//!-----------------------------------------------------------------!//
//* delete user Service
export const deleteUser = async (userId, password) => {
    const user = await UserModel.findById(userId);
    if (!user || user.status !== "active")
        e.NotFoundException({ message: "User not found" });

    const isMatched = await hash.CompareText(password, user.password);
    if (!isMatched) e.BadRequestException({ message: "Wrong password" });

    user.status = "deleted";

    await user.save();

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
