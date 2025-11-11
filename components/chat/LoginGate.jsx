"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

import { selectIsAuthenticated } from "@/components/Redux/Slices/AuthSlice";

export default function LoginGate() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isAuthenticated);
  }, [isAuthenticated]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-brand-sidebar border border-brand-border rounded-xl p-4">
        <h3 className="text-brand-text text-lg mb-2">Sign in to continue</h3>
        <p className="text-brand-muted mb-4">Login with Google or email/password</p>
        <div className="space-y-2">
          <Link className="block w-full text-center bg-brand-input text-brand-text border border-brand-border rounded-md px-3 py-2" href="/login">Login</Link>
          <Link className="block w-full text-center bg-brand-accent text-black rounded-md px-3 py-2" href="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}