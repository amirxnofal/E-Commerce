import mongoose from "mongoose";

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
        otp: String,
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
        profileImage: String,
        address: [String],
    },
    { timestamps: true },
);
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.otp;
        delete ret.__v;
        delete ret.authProvider;
        delete ret.isVerified;
        delete ret.status;
        delete ret.role;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});
export const UserModel = mongoose.model("User", userSchema);
