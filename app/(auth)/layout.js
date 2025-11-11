"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { selectIsAuthenticated } from "@/components/Redux/Slices/AuthSlice";

export default function AuthLayout({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // ✅ Remove Tawk script if it exists
    const tawk = document.getElementById("tawk-to");
   
    if (tawk) tawk.remove();

    // ✅ Reset Tawk API safely
    if (window.Tawk_API) {
      window.Tawk_API = null;
    }
  }, []);

  return <section className="bg-brand-bg min-h-screen">{children}</section>;
}
