import Joi from "joi";

export const updateUserSchema = Joi.object({
    fName: Joi.string().min(3).max(15).optional(),

    lName: Joi.string().min(3).max(15).optional(),

    email: Joi.string().email().optional(),

    address: Joi.string().optional(),
});

export const updatePasswordSchema = Joi.object({
    newPassword: Joi.string()
        .min(8)
        .pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        )
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain at least one letter, one number and one special character",
        }),
    oldPassword: Joi.string()
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

export const deleteAccountSchema = Joi.object({
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

export const changeRoleSchema = Joi.object({
    role: Joi.string().valid("user", "seller", "admin").required().messages({
        "any.only": "Role must be one of: user, seller, admin",
    }),
});

export const changeStatusSchema = Joi.object({
    status: Joi.string()
        .valid("active", "inactive", "deleted")
        .required()
        .messages({
            "any.only": "Status must be one of: active, inactive, deleted",
        }),
});