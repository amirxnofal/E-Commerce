import { SuccessResponse } from "../../common/responses/success.response.js";
import * as s from "./user.service.js";

//* Get user Controller
export const Get_User = async (req, res, next) => {
    try {
        const result = await s.retriveUser(req.user);
        return SuccessResponse({
            res,
            status: 200,
            message: "User retrived successfully",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};

//* Update user data Controller
export const Update_Data = async (req, res, next) => {
    try {
        const result = await s.updateUserData(req.user, req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "User updated successfully",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};

//* Update user image Controller
export const Update_Image = async (req, res, next) => {
    try {
        const result = await s.updateUserImage(req.user, req.file);
        return SuccessResponse({
            res,
            status: 200,
            message: "Image updated successfully",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};

//* Update user password Controller
export const Update_Password = async (req, res, next) => {
    try {
        const result = await s.updateUserPassword(req.user._id, req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "Password updated successfully",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};

//* delete user Controller
export const Delete_User = async (req, res, next) => {
    try {
        const result = await s.deleteUser(req.user._id, req.body.password);
        return SuccessResponse({
            res,
            status: 200,
            message: "Account deleted",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};

//* Get all users Controller
export const Get_All_Users = async (req, res, next) => {
    try {
        const result = await s.retriveAllUsers();
        return SuccessResponse({
            res,
            status: 200,
            message: "Users retrived successfully",
            data: result.users,
        });
    } catch (error) {
        next(error);
    }
};

//* Change user role Controller
export const Change_Role = async (req, res, next) => {
    try {
        const result = await s.changeRole(req.params.id, req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "User role updated successfully",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};

//* Change user status Controller
export const Change_Status = async (req, res, next) => {
    try {
        const result = await s.changeStatus(req.params.id, req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "User status updated successfully",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};
