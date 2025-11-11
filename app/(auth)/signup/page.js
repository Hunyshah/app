/* eslint-disable react/jsx-sort-props */
/* eslint-disable import/order */
/* eslint-disable padding-line-between-statements */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import toast from "react-hot-toast";
import apiFunction from "@/components/apifunction/apiFunction";
import { registerApi } from "@/components/apifunction/ApiFile";
import { InlineSpinner } from "@/components/common/Spinner";


export default function Page() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
const { postData } = apiFunction();
  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");

    try {
      setLoading(true);
      
      const res = await postData(registerApi, { name, email, password });
      if (res?.message) {
        toast.success(res.message);
      }
      router.replace(`/verification?email=${encodeURIComponent(email)}`);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const leftText = "Join AI Sales Forecasting — Start predicting your growth with AI-powered analytics.";

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
          <h1 className="text-brand-text text-2xl mb-4">Create an Account</h1>
          <div className="space-y-2">
            <label htmlFor="signup-name" className="block text-brand-text text-sm mb-1">Name</label>
            <input
              id="signup-name"
              className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="signup-email" className="block text-brand-text text-sm mb-1">Email</label>
            <input
              id="signup-email"
              className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
              placeholder="Enter the email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="signup-password" className="block text-brand-text text-sm mb-1">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border pr-10"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
            <label htmlFor="signup-confirm-password" className="block text-brand-text text-sm mb-1">Confirm Password</label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border pr-10"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-brand-accent text-white rounded-md px-4 py-2 mt-2 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineSpinner className="mb-0" sizeClass="w-5 h-5" colorClass="border-white" />
                  Processing…
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
            <div className="flex justify-between text-xs text-brand-muted">
              <div />
              <Link href="/login">Already have an account? Login here.</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
