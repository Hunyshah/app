/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
/* eslint-disable import/order */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  selectIsAuthenticated,
} from "@/components/Redux/Slices/AuthSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiGoogle } from "react-icons/si";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import apiFunction from "@/components/apifunction/apiFunction";
import { loginApi } from "@/components/apifunction/ApiFile";
import toast from "react-hot-toast";
import { InlineSpinner } from "@/components/common/Spinner";
import { encryptData } from "@/utils/encrypt";

export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Initialize API helper once at top-level (like hooks)
  const { postData } = apiFunction();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      // Basic validation
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      const response = await postData(loginApi, { email, password });
      if (response?.success) {
        const encryptedData = encryptData(response);
        toast.success(response?.message || "Login successful!");
        dispatch(setUser(encryptedData));
        router.replace("/");
      } else {
        toast.error(response?.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Login failed.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const tagline =
    "AI Sales Forecasting — Empower your business with data-driven insights.";

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
          <p className="text-brand-text text-2xl leading-relaxed">{tagline}</p>
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
          <h1 className="text-brand-text text-2xl mb-4">
            Login to Your Account
          </h1>
          <div className="space-y-3" aria-label="auth screen">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-brand-text text-sm mb-1"
              >
                Email
              </label>
              <input
                id="login-email"
                className="w-full bg-brand-input text-brand-text placeholder:text-brand-muted border border-brand-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                placeholder="Enter the email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label
                htmlFor="login-password"
                className="block text-brand-text text-sm mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
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
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={18} />
                  ) : (
                    <AiOutlineEye size={18} />
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full bg-brand-accent text-white rounded-md px-4 py-2 transition ${
                loading ? "opacity-80 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <InlineSpinner
                    className="mb-0"
                    sizeClass="w-5 h-5"
                    colorClass="border-white"
                  />
                  <span>Processing…</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
            <div className="text-xs text-brand-muted text-right mt-1">
              <Link href="/forget-password">Forgot password?</Link>
            </div>
            {/* Google login temporarily hidden */}
            {/*
            <button className="w-full bg-brand-input text-brand-text border border-brand-border rounded-md px-3 py-2 flex items-center justify-center gap-2 hover:brightness-95 transition">
              <SiGoogle size={18} />
              Continue with Google
            </button>
            */}
            <div className="text-xs text-brand-muted text-right">
              <Link href="/signup">Don’t have an account? Sign up here.</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
