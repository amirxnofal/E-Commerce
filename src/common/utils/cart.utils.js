import { CartModel } from "../../database/models/cart.model.js";

export const ensureUserCart = async (userId) => {
    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
        cart = await CartModel.create({
            user: userId,
            items: [],
            totalPrice: 0,
        });
    }

    return cart;
};

export const getUserCartWithPopulate = async (userId) => {
    let cart = await ensureUserCart(userId);

    return await CartModel.findById(cart._id)
        .select("-user")
        .populate("items.product", "name price productImages");
};
