/* eslint-disable import/order */
/* eslint-disable padding-line-between-statements */
/* eslint-disable react/jsx-sort-props */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import apiFunction from "@/components/apifunction/apiFunction";
import { sendOtpApi } from "@/components/apifunction/ApiFile";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const { postData } = apiFunction();
  const leftText = "Forgot your password? No worries — reset it and get back to your AI-powered business insights.";

  const handleSendOtp = async () => {
    try {
      if (!email) {
        setError("Please enter your email.");
        return;
      }
      setError("");
      setLoading(true);
  
      const res = await postData(sendOtpApi, { email });
      // API returns { message: "OTP sent successfully" }
      toast.success(res?.message || "OTP sent successfully.");
      router.replace(`/forget-password/verification?email=${encodeURIComponent(email)}`);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to send OTP.";
      // Map backend 404 to the requested message
      if (msg === "User not found") {
        setError("Email not found.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left section (desktop only) */}
        <div className="hidden lg:flex flex-col justify-center h-full px-8">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" aria-label="Go to login">
              <Image src="/assets/images/mainlogo.png" alt="Logo" width={120} height={30} className="h-8 w-auto" />
            </Link>
          </div>
          <p className="text-brand-text text-2xl leading-relaxed">{leftText}</p>
        </div>

        {/* Right section (form) */}
        <div className="w-full max-w-md lg:max-w-lg mx-auto bg-brand-sidebar border border-brand-border rounded-2xl p-6 shadow-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link href="/" aria-label="Go to login">
              <Image src="/assets/images/mainlogo.png" alt="Logo" width={120} height={30} className="h-8 w-auto" />
            </Link>
          </div>
          <h1 className="text-brand-text text-2xl mb-2">Reset password</h1>
          <p className="text-brand-muted mb-4">We will send an OTP to your email to verify.</p>

          <div className="space-y-2">
            <label htmlFor="fp-email" className="block text-brand-text text-sm mb-1">Email</label>
            <input
              id="fp-email"
              className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
              placeholder="Enter the email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full bg-brand-accent text-white rounded-md px-4 py-2 transition ${loading ? "opacity-80 cursor-not-allowed" : "hover:opacity-90"}`}
            >
              {loading ? "Processing…" : "Send OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
