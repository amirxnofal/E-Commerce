import joi from "joi";
export const filterProductsSchema = joi.object({
    minPrice: joi.number().min(0),
    maxPrice: joi.number().min(0),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10), 
});

export const searchProductsSchema = joi.object({
    query: joi.string().min(1).max(100).required(),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
});
export const addProductSchema = joi.object({
    name: joi.string().required().min(3).max(50).trim(),
    description: joi.string().required().max(250).trim(),
    category: joi.string().required().hex().length(24),
    price: joi.number().required().positive().precision(2),
    stock: joi.number().integer().min(0).required(),
});

export const editProductSchema = joi
    .object({
        name: joi.string().min(3).max(50).trim(),
        description: joi.string().max(250).trim(),
        category: joi.string().hex().length(24),
        price: joi.number().positive().precision(2),
        stock: joi.number().integer().min(0),
        imageAction: joi.string().valid("replace", "append").default("append"),
    })
    .min(1);

export const updateStockSchema = joi.object({
    stock: joi.number().integer().min(0).required(),
});