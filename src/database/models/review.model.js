import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            trim: true,
        },

        content: {
            type: String,
            trim: true,
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            required: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

reviewSchema.index(
    {
        product: 1,
        user: 1,
    },
    {
        unique: true,
    },
);

export const ReviewModel = mongoose.model("Review", reviewSchema);
