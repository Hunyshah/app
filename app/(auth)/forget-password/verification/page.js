/* eslint-disable padding-line-between-statements */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-sort-props */
"use client";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import apiFunction from "@/components/apifunction/apiFunction";
import { verifyResetOtpApi, resetPasswordApi } from "@/components/apifunction/ApiFile";

const OtpInput = dynamic(() => import("react-otp-input").then((m) => m.default), { ssr: false });

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [step, setStep] = useState("otp"); // otp -> reset
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
const { postData } = apiFunction();
  const leftText =
    step === "otp"
      ? "Secure your account — verify your email to activate your personalized AI forecasting dashboard."
      : "Create a new password and continue optimizing your sales forecasts with confidence.";

  const handleVerify = async () => {
    try {
      if (!otp || otp.length < 4) {
        setError("Enter the 4-digit code.");
        return;
      }
      if (!email) {
        setError("Missing email context. Please start from Forgot Password.");
        return;
      }
      setError("");
      setLoading(true);
      
      const res = await postData(verifyResetOtpApi, { email, otp });
      toast.success(res?.message || "OTP verified successfully.");
      setToken(res?.token || "");
      setStep("reset");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Verification failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      if (!password || !confirmPassword) {
        setError("Please fill both password fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!token) {
        setError("Missing reset token. Please verify OTP again.");
        return;
      }
      setError("");
      setLoading(true);
      
      const res = await postData(resetPasswordApi, { token, password });
      toast.success(res?.message || "Password updated successfully.");
      router.replace("/login");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left */}
        <div className="hidden lg:flex flex-col justify-center h-full px-8">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" aria-label="Go to login">
              <Image src="/assets/images/mainlogo.png" alt="Logo" width={120} height={30} className="h-8 w-auto" />
            </Link>
          </div>
          <p className="text-brand-text text-2xl leading-relaxed">{leftText}</p>
        </div>

        {/* Right */}
        <div className="w-full max-w-md lg:max-w-lg mx-auto bg-brand-sidebar border border-brand-border rounded-2xl p-6 shadow-sm">
          <div className="flex lg:hidden justify-center mb-6">
            <Link href="/" aria-label="Go to login">
              <Image src="/assets/images/mainlogo.png" alt="Logo" width={120} height={30} className="h-8 w-auto" />
            </Link>
          </div>

          {step === "otp" ? (
            <>
              <h1 className="text-brand-text text-2xl mb-2">Verify Your Email</h1>
              <p className="text-brand-muted mb-4">Enter the 4-digit code we sent to your email.</p>
              <label className="block text-brand-text text-sm mb-1 text-center">OTP</label>
              <div className="flex justify-center mb-4">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={4}
                  inputType="tel"
                  shouldAutoFocus
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="!w-[4rem] !h-[3rem] rounded-lg bg-brand-input border border-brand-border text-brand-text text-xl text-center focus:outline-none focus:ring-2 focus:ring-brand-border"
                    />
                  )}
                  containerStyle={{ gap: "0.75rem" }}
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
              <button onClick={handleVerify} disabled={loading} className={`w-full bg-brand-accent text-white rounded-md px-4 py-2 transition ${loading ? "opacity-80 cursor-not-allowed" : "hover:opacity-90"}`}>{loading ? "Processing…" : "Verify & Continue"}</button>
            </>
          ) : (
            <>
              <h1 className="text-brand-text text-2xl mb-2">Set New Password</h1>
              <p className="text-brand-muted mb-4">Enter and confirm your new password.</p>
              <div className="space-y-2">
                <label htmlFor="reset-password" className="block text-brand-text text-sm mb-1">Password</label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border pr-10"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </button>
                </div>
                <label htmlFor="reset-confirm-password" className="block text-brand-text text-sm mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border pr-10"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleReset} disabled={loading} className={`w-full bg-brand-accent text-white rounded-md px-4 py-2 mt-2 transition ${loading ? "opacity-80 cursor-not-allowed" : "hover:opacity-90"}`}>{loading ? "Processing…" : "Reset Password"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}