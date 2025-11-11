import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import User from "@/models/user";
import { connectDB } from "@/libs/mongoDB";
connectDB();

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    // Issue temporary token for password reset
    const secretKey = "1wqsadcfvghuji9o0p;l,kjmnhg34rtghnjm,.";
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "15m" });

    user.tokens = token;
    user.otp = "";
    await user.save();

    return NextResponse.json(
      { success: true, message: "OTP verified successfully.", token },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}