"use client";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const headerLessRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/verification",
    "/change-password",
    "/forget-password",
    "/", // Chat page should be headerless
  ];

  return (
    <div>
      <div className={`relative flex flex-col h-screen`}>
        {/* Header temporarily disabled for ChatGPT-style redesign */}
        <main className={`w-full mx-auto ${isMobile ? "pb-16" : ""}`}>
          {children}
        </main>
        {/* Footer temporarily disabled */}

      </div>
    </div>
  );
}
