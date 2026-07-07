import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                priceAtTime: {
                    type: Number,
                    required: true,
                },
                subTotal: {
                    type: Number,
                    required: true,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        totalPrice: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["active", "abandoned", "checked_out"],
            default: "active",
        },

        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //! 30 يوم
        },

        coupon: {
            type: String,
            default: null,
        },

        discount: {
            type: Number,
            default: 0,
        },

        finalPrice: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);


cartSchema.pre("save", function () {
    if (this.items.length === 0) {
        this.totalPrice = 0;
        this.finalPrice = 0;
        return;
    }

    this.totalPrice = this.items.reduce((sum, item) => {
        item.subTotal = item.priceAtTime * item.quantity;
        return sum + item.subTotal;
    }, 0);

    this.finalPrice = this.totalPrice - (this.discount || 0);
});

cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ expiresAt: 1 }); 


export const CartModel = mongoose.model("Cart", cartSchema);
