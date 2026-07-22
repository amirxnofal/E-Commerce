import { Router } from "express";
import { Validation } from "../../common/middleware/validation.middleware.js";
import { upload } from "../../common/middleware/multer.middleware.js";
import { Auth } from "../../common/middleware/auth.middleware.js";
import * as role from "../../common/middleware/role.middleware.js";
import * as c from "./category.controller.js";
import * as v from "./category.validation.js";
import { updateCategory } from "./category.service.js";

const router = Router();

//* Get Categories Route
router.get("/", c.Get_All_Categories);

//* Get category with products Route
router.get("/:id", c.Get_Category_With_Products);

//* Add new Category Route
router.post(
    "/",
    Auth,
    role.authorize("seller", "admin"),
    upload.single("categoryImage"),
    Validation(v.createCategorySchema),
    c.Create_Category,
);

//* Edit category Route
router.patch(
    "/:id",
    Auth,
    role.authorize("admin"),
    upload.single("categoryImage"),
    Validation(v.editCategorySchema),
    c.Edit_Category,
);

//* Delete category Route
router.delete(
    "/:id",
    Auth,
    role.authorize("admin"),
    c.Delete_Category,
);

export default router;
