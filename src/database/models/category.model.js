import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 100,
            trim: true,
            unique: true,
        },

        description: {
            type: String,
            trim: true,
        },

        categoryImage: {
            type: String,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const CategoryModel = mongoose.model("Category", categorySchema);
