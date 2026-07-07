import { SuccessResponse } from "../../common/responses/success.response.js";
import * as s from "./cart.service.js";

//* Get Cart Controller
export const Get_Cart = async (req, res, next) => {
    try {
        const result = await s.getCart(req.user._id);
        return SuccessResponse({
            res,
            status: 200,
            message: "Cart retrieved successfully",
            data: result.cart,
        });
    } catch (error) {
        next(error);
    }
};

//* Add product to cart Controller
export const Add_Product_To_Cart = async (req, res, next) => {
    try {
        const result = await s.addProductToCart(req.user._id, req.body);
        return SuccessResponse({
            res,
            status: 200,
            message: "Product added to cart successfully",
            data: result.cart,
        });
    } catch (error) {
        next(error);
    }
};

//* Update number of product in cart Controller
export const Update_NumberOf_Products_InCart = async (req, res, next) => {
    try {
        const result = await s.updateNumberOfProductInCart(
            req.user._id,
            req.params.id,
            req.body.quantity,
        );
        return SuccessResponse({
            res,
            status: 200,
            message: "Cart updated successfully",
            data: result.cart,
        });
    } catch (error) {
        next(error);
    }
};

//* Remove product from cart Controller
export const Remove_Product_From_Cart = async (req, res, next) => {
    try {
        const result = await s.removeProductFromCart(
            req.user._id,
            req.params.id,
        );
        return SuccessResponse({
            res,
            status: 200,
            message: "Product removed from cart successfully",
            data: result.cart,
        });
    } catch (error) {
        next(error);
    }
};

//* Clear cart Controller
export const Clear_Cart = async (req, res, next) => {
    try {
        const result = await s.clearCart(req.user._id);
        return SuccessResponse({
            res,
            status: 200,
            message: "Cart cleared successfully",
            data: result.cart,
        });
    } catch (error) {
        next(error);
    }
};
