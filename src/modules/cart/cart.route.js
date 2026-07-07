// cart.route.js

import { Router } from "express";
import { Validation } from "../../common/middleware/validation.middleware.js";
import { Auth } from "../../common/middleware/auth.middleware.js";
import * as role from "../../common/middleware/role.middleware.js";

import * as c from "./cart.controller.js";
import * as v from "./cart.validation.js";

const router = Router();

//* Get Cart Route
router.get("/", Auth, role.authorize("user", "seller", "admin"), c.Get_Cart);

//* Add product to cart Route
router.post(
    "/",
    Auth,
    Validation(v.addToCartSchema),
    role.authorize("user", "seller", "admin"),
    c.Add_Product_To_Cart,
);

//* Update number of product in cart Route
router.patch(
    "/:id",
    Auth,
    Validation(v.updateCartItemSchema),
    role.authorize("user", "seller", "admin"),
    c.Update_NumberOf_Products_InCart,
);

//* Remove product from cart Route
router.delete(
    "/:id",
    Auth,
    role.authorize("user", "seller", "admin"),
    c.Remove_Product_From_Cart,
);

//* Clear cart Route
router.delete("/", Auth, role.authorize("user", "seller", "admin"), c.Clear_Cart);

export default router;
