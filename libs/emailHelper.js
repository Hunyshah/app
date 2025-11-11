import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Read credentials with backwards compatibility and trim accidental spaces
const emailUser = process.env.EMAIL_USER;
const rawPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;
const emailPass = rawPass ? rawPass.replace(/\s+/g, "") : undefined;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
