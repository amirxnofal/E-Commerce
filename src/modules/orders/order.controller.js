// import { SuccessResponse } from "../../common/responses/success.response.js";
// import * as s from "./category.service.js";

// //* Get Categories Controller
// export const Get_All_Categories = async (req, res, next) => {
//     try {
//         const result = await s.getCategories();
//         return SuccessResponse({
//             res,
//             status: 200,
//             message: "Retrive success",
//             data: result.categories,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// //!-----------------------------------------------------------------------------!//

// //* Get category with products Controller
// export const Get_Category_With_Products = async (req, res, next) => {
//     try {
//         const result = await s.getCategoryById(req.params.id);
//         return SuccessResponse({
//             res,
//             status: 200,
//             message: "Retrive success",
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// //!-----------------------------------------------------------------------------!//

// // //* Add new Category Controller
// export const Create_Category = async (req, res, next) => {
//     try {
//         const result = await s.createCategory(req.body, req.user, req.file);
//         return SuccessResponse({
//             res,
//             status: 201,
//             message: "Category created successfully",
//             data: result.category,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// //!-----------------------------------------------------------------------------!//

// //* Edit category Controller
// export const Edit_Category = async (req, res, next) => {
//     try {
//         const result = await s.updateCategory(
//             req.params.id,
//             req.body,
//             req.file,
//         );
//         return SuccessResponse({
//             res,
//             status: 200,
//             message: "Category updated successfully",
//             data: result.category,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// //!-----------------------------------------------------------------------------!//

// //* Delete category Controller
// export const Delete_Category = async (req, res, next) => {
//     try {
//         const result = await s.deleteCategory(req.params.id);
//         return SuccessResponse({
//             res,
//             status: 200,
//             message: "Category deleted successfully",
//             data: result.category,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// //!-----------------------------------------------------------------------------!//
