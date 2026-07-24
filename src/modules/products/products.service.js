import { ProductModel } from "../../database/models/product.model.js";
import { CategoryModel } from "../../database/models/category.model.js";
import { uploadToCloudinary } from "../../common/utils/cloudinary.utils.js";
import * as e from "../../common/responses/error.response.js";
import { env } from "../../config/env.service.js";
import fs from "fs";
import cloudinary from "../../config/cloudinary.config.js";
import {
    addNewImages,
    deleteOldImages,
    rollbackUploadedImages,
} from "./product.images.service.js";

//!-----------------------------------------------------------------------------!//
//* Get products Service
export const retriveAllProducts = async () => {
    const products = await ProductModel.find({ status: "active" });
    return { products };
};
//!-----------------------------------------------------------------------------!//

//* Get products by ID Service
export const retriveProductsId = async (productsId) => {
    const product = await ProductModel.findById(productsId);
    if (!product || product.status !== "active")
        e.NotFoundException({ message: "No products found by this ID" });

    return { product };
};
//!-----------------------------------------------------------------------------!//

//* Search in products Service
export const searchProducts = async (data) => {
    let { query, page, limit } = data;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const search = {
        status: "active",
        $or: [
            { name: { $regex: escapeRegex(query), $options: "i" } },
            { description: { $regex: escapeRegex(query), $options: "i" } },
        ],
    };

    if (!query || !query.trim())
        e.BadRequestException({ message: "Search query is required" });

    const [products, total] = await Promise.all([
        ProductModel.find(search).skip(skip).limit(limit),
        ProductModel.countDocuments(search),
    ]);

    return {
        products: products.length === 0 ? [] : products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
//!-----------------------------------------------------------------------------!//

//* Filter products Service
export const filterProducts = async (query) => {
    let { category, minPrice, maxPrice, page, limit } = query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    minPrice = isNaN(parseInt(minPrice)) ? undefined : parseInt(minPrice);
    maxPrice = isNaN(parseInt(maxPrice)) ? undefined : parseInt(maxPrice);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const filter = {};
    let cat = null;

    if (category) {
        cat = await CategoryModel.findOne({ name: category });
        if (!cat) throw e.NotFoundException({ message: "Category not found" });
        filter.category = cat._id;
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = minPrice;
        if (maxPrice) filter.price.$lte = maxPrice;
    }

    const [products, total] = await Promise.all([
        ProductModel.find(filter).skip(skip).limit(limit),
        ProductModel.countDocuments(filter),
    ]);

    return {
        products: products.length === 0 ? [] : products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
//!-----------------------------------------------------------------------------!//

//* Add new products Service
export const createProduct = async (seller, data, files) => {
    const { name, description, category, price, stock } = data;
    const isCategory = await CategoryModel.findById(category);
    if (!isCategory) e.NotFoundException({ message: "Category not found" });

    const uploadedImages = [];
    const failedImages = [];
    if (files?.length) {
        for (const file of files) {
            try {
                const uploadResult = await uploadToCloudinary(
                    file.path,
                    `users/${seller._id}/productsImages`,
                );

                uploadedImages.push({
                    public_id: uploadResult.public_id,
                    secure_url: uploadResult.secure_url,
                });
            } catch (error) {
                failedImages.push({
                    fileName: file.originalname,
                    cause: error.message,
                });
            }
        }
    }
    if (uploadedImages.length === 0)
        e.BadRequestException({ message: "Must upload 1 image atleast" });
    let product;
    try {
        product = await ProductModel.create({
            name,
            description,
            category,
            price,
            stock,
            seller: seller._id,
            productImages: uploadedImages,
            status: "active",
        });
    } catch (error) {
        await Promise.allSettled(
            uploadedImages.map((img) =>
                cloudinary.uploader.destroy(img.public_id),
            ),
        );

        throw error;
    }

    return { product, failedImages };
};
//!-----------------------------------------------------------------------------!//

//* Update products Service
export const editProduct = async (seller, productId, data, files) => {
    const { name, description, category, price, stock, oldPublicIds } = data;

    const product = await ProductModel.findById(productId);
    if (!product) throw e.NotFoundException({ message: "Product not found!" });

    if (seller._id.toString() !== product.seller.toString())
        throw e.UnAuthorizedException({
            message: "Unauthorized to edit this product",
        });

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;

    if (category) {
        const cat = await CategoryModel.findById(category);
        if (!cat) throw e.NotFoundException({ message: "Category not found!" });
        product.category = category;
    }

    let uploadedImages = [];
    if (files?.length) {
        const addedImages = await addNewImages(seller, files);
        uploadedImages = addedImages.uploadedImages;
        uploadedImages.forEach((img) => {
            product.productImages.push(img);
        });
    }

    const originalImages = [...product.productImages];
    const idsToDelete = oldPublicIds?.length ? oldPublicIds : [];

    if (idsToDelete.length) {
        const existingIds = new Set(originalImages.map((img) => img.public_id));
        const invalidIds = idsToDelete.filter((id) => !existingIds.has(id));
        
        if (invalidIds.length) {
            await rollbackUploadedImages(uploadedImages);
            throw e.BadRequestException({
                message: "Some image ids do not belong to this product",
                extra: { invalidIds },
            });
        }

        product.productImages = product.productImages.filter(
            (img) => !idsToDelete.includes(img.public_id),
        );
    }

    try {
        await product.save();
    } catch (error) {
        await rollbackUploadedImages(uploadedImages);
        throw error;
    }

    if (idsToDelete.length) {
        const deletionResult = await deleteOldImages(
            originalImages,
            idsToDelete,
        );

        if (deletionResult.failedImages.length) {
            console.error(
                "Some old images failed to delete from Cloudinary:",
                deletionResult.failedImages,
            );
        }
    }

    return { product };
};

//!-----------------------------------------------------------------------------!//

//* delete products Service
export const deleteProduct = async (seller, productId) => {
    const product = await ProductModel.findById(productId);
    if (!product) throw e.NotFoundException({ message: "Product not found!" });

    const isOwner = seller._id.toString() === product.seller.toString();
    const isAdmin = seller.role === "admin";

    if (!isOwner && !isAdmin)
        throw e.UnAuthorizedException({
            message: "Unauthorized to delete this product",
        });

    if (product.productImages?.length) {
        product.productImages.forEach((imgUrl) => {
            const filePath = imgUrl.replace(`${env.serverUrl}/`, "");
            fs.unlink(filePath, () => {});
        });
    }

    //? Hard delete
    // const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    // return { product: deletedProduct };
    //? Soft delete
    product.status = "deleted";
    await product.save();

    return { product };
};
//!-----------------------------------------------------------------------------!//

//* Update products stock Service
export const updateStock = async (seller, productId, stock) => {
    const product = await ProductModel.findById(productId);
    if (!product) throw e.NotFoundException({ message: "Product not found!" });

    if (seller._id.toString() !== product.seller.toString())
        throw e.UnAuthorizedException({
            message: "Unauthorized to edit this product",
        });

    product.stock = stock;

    await product.save();

    return { product };
};
//!-----------------------------------------------------------------------------!//

//* Get all  seller products Service
export const retriveAllSellerProduct = async (seller) => {
    const products = await ProductModel.find({
        seller: seller._id,
        status: "active",
    });
    return { products };
};
//!-----------------------------------------------------------------------------!//
