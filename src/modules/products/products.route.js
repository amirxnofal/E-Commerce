import { Router } from "express";
import { Validation } from "../../common/middleware/validation.middleware.js";
import { upload } from "../../common/middleware/multer.middleware.js";
import { Auth } from "../../common/middleware/auth.middleware.js";
import * as role from "../../common/middleware/role.middleware.js";
import * as c from "./products.controller.js";
import {
    addProductSchema,
    editProductSchema,
    filterProductsSchema,
    searchProductsSchema,
    updateStockSchema,
} from "./products.validation.js";
const router = Router();

//* Get products Route
router.get("/", c.Get_All_Product);

//* Search in products Route
router.get("/search", Validation(searchProductsSchema), c.Search_Products);

//* Filter products Route
router.get("/filter", Validation(filterProductsSchema), c.Filter_Products);

//* Get products by ID Route
router.get("/:id", c.Get_Product_By_ID);

//* Add new products Route
router.post(
    "/",
    Auth,
    role.authorize("seller"),
    upload.array("productImages"),
    Validation(addProductSchema),
    c.Create_Product,
);

//* Update products Route
router.patch(
    "/:id",
    Auth,
    role.authorize("seller"),
    upload.array("productImages"),
    Validation(editProductSchema),
    c.Update_Product,
);

//* delete products Route
router.delete(
    "/:id",
    Auth,
    role.authorize("seller", "admin"),
    c.Delete_Product,
);

//* Update products stock Route
router.patch(
    "/:id/stock",
    Auth,
    role.authorize("seller"),
    Validation(updateStockSchema),
    c.Update_Stock,
);

//* Get all  seller products Route
router.get(
    "/seller/my-products",
    Auth,
    role.authorize("seller"),
    c.Get_All_SellerProducts,
);

export default router;
