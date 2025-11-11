/* eslint-disable import/order */
/* eslint-disable padding-line-between-statements */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import toast from "react-hot-toast";
import apiFunction from "@/components/apifunction/apiFunction";
import { verifyOtpApi } from "@/components/apifunction/ApiFile";
import { InlineSpinner } from "@/components/common/Spinner";


// Ensure we import the component's default export on the client only
const OtpInput = dynamic(
  () => import("react-otp-input").then((mod) => mod.default),
  { ssr: false }
);

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tempEmail = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 const { postData } = apiFunction();
  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter the 4-digit code.");
      return;
    }
    if (!tempEmail) {
      setError("Missing email context. Please sign up first.");
      return;
    }
    setError("");

    try {
      setLoading(true);
     
      const res = await postData(verifyOtpApi, { email: tempEmail, otp });
      toast.success(res?.message || "OTP verified successfully");
      router.replace("/login");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Verification failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const leftText =
    "Verify your account to unlock your personalized AI dashboard.";

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left section (desktop only) */}
        <div className="hidden lg:flex flex-col justify-center h-full px-8">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" aria-label="Go to login">
              <Image
                src="/assets/images/mainlogo.png"
                alt="Logo"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <p className="text-brand-text text-2xl leading-relaxed">{leftText}</p>
        </div>

        {/* Right section (form) */}
        <div className="w-full max-w-md lg:max-w-lg mx-auto bg-brand-sidebar border border-brand-border rounded-2xl p-6 shadow-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link href="/" aria-label="Go to login">
              <Image
                src="/assets/images/mainlogo.png"
                alt="Logo"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <h1 className="text-brand-text text-2xl mb-2">Verify Your Account</h1>
          <p className="text-brand-muted mb-4">
            Enter the 4-digit code we sent to your email.
          </p>
          <label className="block text-brand-text text-sm mb-1">OTP</label>
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
          {error && (
            <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-brand-accent text-white rounded-md px-4 py-2 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <InlineSpinner className="mb-0" sizeClass="w-5 h-5" colorClass="border-white" />
                Verifying…
              </span>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
