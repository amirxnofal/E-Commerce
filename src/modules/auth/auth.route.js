import { Router } from "express";
import * as c from "./auth.controller.js";
import { Validation } from "../../common/middleware/validation.middleware.js";
import * as sch from "../../modules/auth/auth.validation.js";
import { upload } from "../../common/middleware/multer.middleware.js";
import { Auth } from "../../common/middleware/auth.middleware.js";
import { authLimit } from "../../common/middleware/rateLimit.middleware.js";

const router = Router();
//* Register Route
router.post(
    "/register",
    upload.single("profileImage"),
    Validation(sch.registerSchema),
    authLimit,
    c.Register,
);

//* Login Route
router.post("/login", Validation(sch.loginSchema), authLimit, c.Login);

//* Verify email Route
router.post("/verify-email", Validation(sch.verifyEmailSchema), c.Verify);

//* Google login Route
router.post("/google-login", authLimit, c.google);

//* Refresh Token Route
router.post("/refresh-token", c.Refresh_Token);

//* Forget password Route
router.post(
    "/forgot-password",
    Validation(sch.forgetPasswordSchema),
    authLimit,
    c.Forgot_Password,
);

//* Reset Password Route
router.post(
    "/reset-password",
    Validation(sch.resetPasswordSchema),
    c.Reset_Password,
);

//* Resend OTP Route
router.post("/resend-otp", c.Resend_OTP);

//* Logout Route  ( Disable refresh token )
router.post("/logout", Auth, Validation(sch.logoutSchema), c.Logout);

export default router;
