import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 100,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        productImages: {
            type: [
                {
                    public_id: String,
                    secure_url: String,
                },
            ],
            default: [],
        },

        stock: {
            type: Number,
            min: 0,
            default: 0,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "deleted"],
            default: "active",
        },
    },
    {
        timestamps: true,
    },
);

export const ProductModel = mongoose.model("Product", productSchema);
