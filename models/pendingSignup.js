import mongoose from "mongoose";

const pendingSignupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Store hashed password here; user will be created after OTP verification
    password: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const PendingSignup =
  mongoose.models.PendingSignup || mongoose.model("PendingSignup", pendingSignupSchema);

export default PendingSignup;