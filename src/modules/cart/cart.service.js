import * as e from "../../common/responses/error.response.js";
import { ProductModel } from "../../database/models/product.model.js";
import { CartModel } from "../../database/models/cart.model.js";
import {
    getUserCartWithPopulate,
    ensureUserCart,
} from "../../common/utils/cart.utils.js";

//* Get Cart Service
export const getCart = async (userId) => {
    const cart = await getUserCartWithPopulate(userId);
    return { cart };
};

//* Add product to cart Service
export const addProductToCart = async (userId, data) => {
    const { items } = data;
    const cart = await ensureUserCart(userId);

    for (let i = 0; i < items.length; i++) {
        const product = await ProductModel.findById(items[i].product);
        if (!product) e.NotFoundException({ message: "Product not found" });

        if (product.stock === 0)
            e.BadRequestException({ message: "Out of stock" });

        if (items[i].quantity < 1) items[i].quantity = 1;

        if (items[i].quantity > product.stock)
            e.BadRequestException({
                message: `Not enough stock. Available: ${product.stock}`,
            });

        let existingItem = cart.items.find(
            (itm) => itm.product.toString() === product._id.toString(),
        );

        if (existingItem) {
            const stockNeeded = items[i].quantity - existingItem.quantity;
            if (stockNeeded > 0 && product.stock < stockNeeded)
                e.BadRequestException({
                    message: `Not enough stock. Available: ${product.stock}`,
                });

            product.stock -= stockNeeded;
            existingItem.quantity += items[i].quantity;
            existingItem.subTotal =
                existingItem.priceAtTime * existingItem.quantity;
        } else {
            cart.items.push({
                product: product._id,
                quantity: items[i].quantity,
                priceAtTime: product.price,
                subTotal: product.price * items[i].quantity,
            });
            product.stock -= items[i].quantity;
        }

        await product.save();
    }

    await cart.save();
    const populatedCart = await getUserCartWithPopulate(userId);
    return { cart: populatedCart };
};

//* Update number of product in cart Service
export const updateNumberOfProductInCart = async (
    userId,
    productId,
    quantity,
) => {
    const cart = await ensureUserCart(userId);

    const product = await ProductModel.findById(productId);
    if (!product) e.NotFoundException({ message: "Product not found" });

    const cartItem = cart.items.find(
        (itm) => itm.product.toString() === productId,
    );
    if (!cartItem)
        e.BadRequestException({ message: "Product not found in your cart" });

    if (quantity < 1) quantity = 1;

    const stockNeeded = quantity - cartItem.quantity;
    if (stockNeeded > 0 && product.stock < stockNeeded)
        e.BadRequestException({
            message: `Not enough stock. Available: ${product.stock}`,
        });

    product.stock -= stockNeeded;
    cartItem.quantity = quantity;
    cartItem.subTotal = cartItem.priceAtTime * quantity;

    await product.save();
    await cart.save();

    const populatedCart = await getUserCartWithPopulate(userId);
    return { cart: populatedCart };
};

//* Remove product from cart Service
export const removeProductFromCart = async (userId, productId) => {
    const cart = await ensureUserCart(userId);

    const cartItem = cart.items.find(
        (itm) => itm.product.toString() === productId,
    );
    if (!cartItem)
        e.BadRequestException({ message: "Product not found in your cart" });

    const product = await ProductModel.findById(productId);
    if (product) {
        product.stock += cartItem.quantity;
        await product.save();
    }

    cart.items = cart.items.filter(
        (itm) => itm.product.toString() !== productId,
    );

    await cart.save();

    const populatedCart = await getUserCartWithPopulate(userId);
    return { cart: populatedCart };
};

//* Clear cart Service
export const clearCart = async (userId) => {
    const cart = await ensureUserCart(userId);

    for (let item of cart.items) {
        const product = await ProductModel.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    cart.items = [];
    await cart.save();

    const populatedCart = await getUserCartWithPopulate(userId);
    return { cart: populatedCart };
};
