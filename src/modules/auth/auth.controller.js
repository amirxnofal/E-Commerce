import { SuccessResponse } from "../../common/responses/success.response.js";
import * as s from "./auth.service.js";

//* Register Controller
export const Register = async (req, res, next) => {
    try {
        const result = await s.register(req.body, req.file);
        return SuccessResponse({
            res,
            status: 200,
            message: "Register success",
            data: result.user,
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* Login Controller
export const Login = async (req, res, next) => {
    try {
        const result = await s.login(req.body, req.get("host"));
        return SuccessResponse({
            res,
            status: 200,
            message: "Login success",
            data: {
                user: result.isExist,
                accessToken: result.token.accessToken,
                refreshToken: result.token.refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* Verify email Controller
export const Verify = async (req, res, next) => {
    try {
        const result = await s.verifyEmail(req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "Email verified successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* google Controller
export const google = async (req, res, next) => {
    try {
        const result = await s.googleLogin(req.body, req.get("host"));
        return SuccessResponse({
            res,
            status: 200,
            message: "Google login success",
            data: {
                user: result.user,
                accessToken: result.token.accessToken,
                refreshToken: result.token.refreshToken,
                isNewUser: result.isNewUser,
            },
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* Refresh Token Controller
export const Refresh_Token = async (req, res, next) => {
    try {
        const result = await s.refreshToken(
            req.headers.authorization,
            req.get("host"),
        );
        return SuccessResponse({
            res,
            status: 200,
            message: "Success",
            token: { accessToken: result.token },
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* Forget password  Controller
export const Forgot_Password = async (req, res, next) => {
    try {
        const result = await s.forgotPassword(req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "Success",
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* Reset password  Controller
export const Reset_Password = async (req, res, next) => {
    try {
        const result = await s.resetPassword(req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "Success",
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* Resend OTP  Controller
export const Resend_OTP = async (req, res, next) => {
    try {
        const result = await s.resendOtp(req.body.email);
        return SuccessResponse({
            res,
            status: 200,
            message: "Success",
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

//!-----------------------------------------------------------------------------!//
//* logout  Controller
export const Logout = async (req, res, next) => {
    try {
        const result = await s.logout(req.user._id, req);

        return SuccessResponse({
            res,
            status: 200,
            message: "Success",
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};
