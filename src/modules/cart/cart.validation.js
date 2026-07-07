
import Joi from "joi";

export const addToCartSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                product: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
            }),
        )
        .required(),
});

export const updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required(),
});
