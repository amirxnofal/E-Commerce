import { Router } from "express";
import { Validation } from "../../common/middleware/validation.middleware.js";
import { uploadUser } from "../../common/middleware/multer.middleware.js";
import { Auth } from "../../common/middleware/auth.middleware.js";
import * as role from "../../common/middleware/role.middleware.js";
import * as c from "./user.controller.js";
import * as sch from "./user.validation.js";
const router = Router();

//* Get user Route
router.get(
    "/profile",
    Auth,
    role.authorize("user", "seller", "admin"),
    c.Get_User,
);

//* Update user data Route
router.patch(
    "/profile",
    Auth,
    Validation(sch.updateUserSchema),
    role.authorize("user", "seller", "admin"),
    c.Update_Data,
);

//* Update user image Route
router.patch(
    "/profile-image",
    Auth,
    uploadUser.single("profileImage"),
    role.authorize("user", "seller", "admin"),
    c.Update_Image,
);

//* Update user password Route
router.patch(
    "/change-password",
    Auth,
    Validation(sch.updatePasswordSchema),
    role.authorize("user", "seller", "admin"),
    c.Update_Password,
);

//* delete user Route
router.delete(
    "/profile",
    Auth,
    Validation(sch.deleteAccountSchema),
    role.authorize("user", "seller", "admin"),
    c.Delete_User,
);

//* Get all users Route
router.get("/all", Auth, role.authorize("admin"), c.Get_All_Users);

//* Change user role Route
router.patch(
    "/:id/role",
    Auth,
    Validation(sch.changeRoleSchema),
    role.authorize("admin"),
    c.Change_Role,
);

//* Change user status Route
router.patch(
    "/:id/status",
    Auth,
    Validation(sch.changeStatusSchema),
    role.authorize("admin"),
    c.Change_Status,
);
export default router;
