import nodemailer from "nodemailer";
import { env } from "../../config/env.service.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.googleAppEmail,
        pass: env.googleAppPassword,
    },
});

const html = (otp) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; text-align: center;">
        <h1 style="color: #4F46E5;">E-Commerce 💬</h1>
        <p>Your OTP Code is:</p>
        <h2>${otp}</h2>
        <p>This code expires in 10 minutes.</p>
    </div>
</body>
</html>
`;

export const SendEmail = async ({ to, subject, otp }) => {
    return transporter.sendMail({
        from: `"Amir Mohamed" <${env.googleAppEmail}>`,
        to,
        subject,
        html: html(otp),
    });
};
