import { CategoryModel } from "../../database/models/category.model.js";
import * as e from "../../common/responses/error.response.js";
import { ProductModel } from "../../database/models/product.model.js";
import { env } from "../../config/env.service.js";


//* Get Categories Service
export const getCategories = async () => {
    const categories = await CategoryModel.find();
    return { categories };
};

//* Get category with products Service
export const getCategoryById = async (categoryId) => {
    const [category, products] = await Promise.all([
        CategoryModel.findById(categoryId),
        ProductModel.find({ category: categoryId }),
    ]);
    if (!category) e.NotFoundException({ message: "Category not found!" });

    return { category, products };
};

//* Add new Category Service
export const createCategory = async (data, createdBy, file) => {
    let { name, description } = data;

    const isExist = await CategoryModel.findOne({ name });
    if (isExist) e.ConflictException({ message: "Category already exist!" });

    const categoryImage = file ? `${env.serverUrl}/${file.path}` : null;

    const category = await CategoryModel.create({
        name,
        description,
        categoryImage,
        createdBy,
    });

    return { category };
};

//* Edit Category Service
export const updateCategory = async (categoryId, data, file) => {
    let { name, description } = data;

    const category = await CategoryModel.findById(categoryId);
    if (!category) e.NotFoundException({ message: "Category not found!" });

    category.categoryImage = file
        ? `${env.serverUrl}/${file.path}`
        : category.categoryImage;

    if (name) {
        const cat = await CategoryModel.findOne({
            name,
            _id: { $ne: categoryId },
        });
        if (cat) e.NotFoundException({ message: "Category already exist!" });
        category.name = name;
    }
    if (description) category.description = description;

    await category.save();
    return { category };
};

//* Delete Category Service
export const deleteCategory = async (categoryId) => {
    const category = await CategoryModel.findById(categoryId);
    if (!category) e.NotFoundException({ message: "Category not found!" });
    const products = await ProductModel.findOne({ category: category._id });
    if (products)
        e.ConflictException({
            message: "Cant delete category when has products!",
        });

    await category.deleteOne();

    return { category };
};
