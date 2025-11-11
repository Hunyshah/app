/* eslint-disable padding-line-between-statements */
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import User from "@/models/user";
import PendingSignup from "@/models/pendingSignup";
import { connectDB } from "@/libs/mongoDB";
import { sendEmail } from "@/libs/emailHelper";
import { buildSignupOtpEmail } from "@/libs/emailTemplates";

connectDB();
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // If a verified user already exists, block signup
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists." },
        { status: 400 }
      );
    }

    // Clear any previous pending signup for this email
    await PendingSignup.deleteOne({ email });

    // Generate OTP valid for 5 minutes
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Hash the password now; we'll create the user on OTP verification
    const hashedPassword = await bcrypt.hash(password, 10);

    const pending = new PendingSignup({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiresAt,
    });
    await pending.save();

    // Send branded HTML OTP email
    const html = buildSignupOtpEmail(otp);
    await sendEmail(email, "Verify your email", html);

    return NextResponse.json(
      { success: true, message: "OTP sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
