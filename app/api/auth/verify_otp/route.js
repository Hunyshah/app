import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import User from "@/models/user";
import PendingSignup from "@/models/pendingSignup";
import { connectDB } from "@/libs/mongoDB";
connectDB();
export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    // Find pending signup
    const pending = await PendingSignup.findOne({ email });

    if (!pending) {
      return NextResponse.json({ success: false, message: "No pending signup found" }, { status: 404 });
    }

    // Validate OTP and expiration
    if (pending.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }
    if (pending.otpExpiresAt && pending.otpExpiresAt < new Date()) {
      return NextResponse.json({ success: false, message: "OTP expired" }, { status: 400 });
    }

    // Double-check that a user was not somehow created meanwhile
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Cleanup stale pending record
      await PendingSignup.deleteOne({ _id: pending._id });

      return NextResponse.json({ success: false, message: "Email already exists." }, { status: 400 });
    }

    // Create verified user from pending details
    const user = new User({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      isVerified: true,
      otp: "",
    });

    await user.save();

    // Remove pending signup
    await PendingSignup.deleteOne({ _id: pending._id });

    // Issue token
    const secretKey = "1wqsadcfvghuji9o0p;l,kjmnhg34rtghnjm,.";
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "1d" });

    user.tokens = token;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Registered successfully.", token, user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
