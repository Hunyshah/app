import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import User from "@/models/user";
import { connectDB } from "@/libs/mongoDB";
connectDB();
export async function POST(request) {
  try {
    const { token, password } = await request.json();
    const user = await User.findOne({ tokens: token });
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.otp = "";
    user.tokens = "";
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
