import Joi from "joi";

export const registerSchema = Joi.object({
    fName: Joi.string().min(3).max(15).required(),

    lName: Joi.string().min(3).max(15).required(),

    email: Joi.string().email().required(),

    password: Joi.string()
        .min(8)
        .pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        )
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain at least one letter, one number and one special character",
        }),
    address: Joi.string().optional().trim(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        )
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain at least one letter, one number and one special character",
        }),
});

export const verifyEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});

export const forgetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        )
        .required(),
    otp: Joi.string().length(6).required(),
});

export const logoutSchema = Joi.object({
    refreshToken: Joi.string().required(),
});