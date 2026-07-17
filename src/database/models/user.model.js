import mongoose from "mongoose";
import {
    defaultPublicId,
    defaultSecureUrl,
} from "../../common/Constant/cloudinary.constant.js";

const userSchema = mongoose.Schema(
    {
        fName: {
            type: String,
            minLength: 3,
            maxLength: 15,
            trim: true,
        },
        lName: {
            type: String,
            maxLength: 15,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid email address",
            ],
            unique: true,
            required: true,
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        password: {
            type: String,
            required: function () {
                return this.authProvider === "local";
            },
            trim: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["user", "seller", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["active", "inactive", "deleted"],
            default: "inactive",
        },
        profileImage: {
            public_id: {
                type: String,
                default: defaultPublicId,
            },
            secure_url: {
                type: String,
                default: defaultSecureUrl,
            },
        },
        address: [String],
    },
    { timestamps: true },
);
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.otp;
        return ret;
    },
});
export const UserModel = mongoose.model("User", userSchema);
