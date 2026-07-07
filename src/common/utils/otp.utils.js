import { CompareText } from "./hash.utils.js";

export const OTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

