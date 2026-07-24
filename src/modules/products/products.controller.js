import { SuccessResponse } from "../../common/responses/success.response.js";
import * as p from "./products.service.js";

//* Get products Controller
export const Get_All_Product = async (req, res, next) => {
    try {
        const result = await p.retriveAllProducts();
        return SuccessResponse({
            res,
            status: 200,
            message: "Retrive success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* Get products by ID Controller
export const Get_Product_By_ID = async (req, res, next) => {
    try {
        const result = await p.retriveProductsId(req.params.id);
        return SuccessResponse({
            res,
            status: 200,
            message: "Retrive success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* Search in products Controller
export const Search_Products = async (req, res, next) => {
    try {
        const result = await p.searchProducts(req.query);
        return SuccessResponse({
            res,
            status: 200,
            message: "Search success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* Filter products Controller
export const Filter_Products = async (req, res, next) => {
    try {
        const result = await p.filterProducts(req.query);

        return SuccessResponse({
            res,
            status: 200,
            message: "Filter success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* Add new products Controller
export const Create_Product = async (req, res, next) => {
    try {
        const result = await p.createProduct(req.user, req.body, req.files);
        return SuccessResponse({
            res,
            status: 201,
            message: "Product created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* Update products Controller
export const Update_Product = async (req, res, next) => {
    try {
        const result = await p.editProduct(
            req.user,
            req.params.id,
            req.body,
            req.files,
        );
        return SuccessResponse({
            res,
            status: 200,
            message: "Product updated successfully",
            data: result.product,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* delete products Controller
export const Delete_Product = async (req, res, next) => {
    try {
        const result = await p.deleteProduct(req.user, req.params.id);
        return SuccessResponse({
            res,
            status: 200,
            message: "Product deleted successfully",
            data: result.product,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* Update products stock Controller
export const Update_Stock = async (req, res, next) => {
    try {
        const result = await p.updateStock(
            req.user,
            req.params.id,
            req.body.stock,
        );
        return SuccessResponse({
            res,
            status: 200,
            message: "Product updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//

//* Get all  seller products Controller
export const Get_All_SellerProducts = async (req, res, next) => {
    try {
        const result = await p.retriveAllSellerProduct(req.user);
        return SuccessResponse({
            res,
            status: 200,
            message: "Products retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
//!-----------------------------------------------------------------------------!//
