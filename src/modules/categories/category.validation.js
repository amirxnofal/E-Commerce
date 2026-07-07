import Joi from "joi";

export const createCategorySchema = Joi.object({
    name: Joi.string().required().min(3).max(50).trim(),
    description: Joi.string().required().max(350).trim(),
});

export const editCategorySchema = Joi.object({
    name: Joi.string().optional().min(3).max(50).trim(),
    description: Joi.string().optional().max(350).trim(),
});
