import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "@/models/user";
import { connectDB } from "@/libs/mongoDB";

connectDB();
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const user = await User.findOne({ email:email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: "User not verified" },
        { status: 401 }
      );
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }
    const secretKey = "1wqsadcfvghuji9o0p;l,kjmnhg34rtghnjm,.";
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "1d" });

    user.tokens = token;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Login successful", token, user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
