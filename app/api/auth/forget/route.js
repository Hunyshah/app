import { NextResponse } from "next/server";

import User from "@/models/user";
import { connectDB } from "@/libs/mongoDB";
import { sendEmail } from "@/libs/emailHelper";
import { buildResetOtpEmail } from "@/libs/emailTemplates";
connectDB();
export async function POST(request) {
  try {
    const { email } = await request.json();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = otp;
    await user.save();
    // Replace plain text email body with HTML template using the same design
    await sendEmail(email, "Reset your password", buildResetOtpEmail(otp));

   
    return NextResponse.json(
      { success: true, message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
