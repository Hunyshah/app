/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import CategoryTable from "./CategoryTable";
import BusinessDataTable from "./BusinessDataTable";

import apiFunction from "@/components/apifunction/apiFunction";
import LoginGate from "@/components/chat/LoginGate";
import { logout } from "@/components/Redux/Slices/AuthSlice";

const ChartCard = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="bg-brand-sidebar border border-brand-border rounded-xl p-4 shadow-sm"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-brand-text text-sm font-medium">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const BarChart = ({ data, labels, color = "#0f9d7c" }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="h-40 grid grid-cols-12 gap-2 items-end">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="relative rounded-md"
          style={{ backgroundColor: color }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-brand-text">
            {v}
          </span>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-brand-muted">
            {labels?.[i] ?? i + 1}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const LineChart = ({ data, color = "#3b82f6" }) => {
  const points = useMemo(() => {
    const w = 300;
    const h = 160;
    const max = Math.max(...data, 1);
    const stepX = w / (data.length - 1);
    return data.map((v, i) => [i * stepX, h - (v / max) * h]);
  }, [data]);

  const pathD = useMemo(() => {
    return points
      .map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`))
      .join(" ");
  }, [points]);

  return (
    <div className="h-40 w-full flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 160"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />
        {/* Area fill */}
        <motion.path
          d={`${pathD} L 300 160 L 0 160 Z`}
          fill="url(#area)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      </svg>
    </div>
  );
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userData } = apiFunction();
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarSrc = userData?.user?.image && userData?.user?.image !== "" ? userData?.user?.image : "/assets/images/default-avatar.png";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  // Dummy chart data
  const categoriesData = [8, 12, 10, 15, 9, 7, 11, 14, 8, 13, 12, 9];
  const categoriesLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const costData = [120, 150, 180, 160, 210, 190, 220, 240, 200, 230, 210, 260];
  const salesTrend = [20, 24, 22, 26, 25, 28, 30, 27, 31, 29, 33, 35];

  // CategoryTable will handle its own state internally

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Auth gate overlay */}
      <LoginGate />

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-brand-sidebar/80 backdrop-blur-md border-b border-brand-border">
        <div className="container mx-auto px-3 py-3 flex items-center justify-between">
          {/* Left: Logo to home */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/images/mainlogo.png"
              alt="Logo"
              width={120}
              height={30}
              className="h-7 w-auto"
            />
          </Link>

          {/* Right: Avatar with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-input p-1 hover:brightness-95"
              aria-label="Open user menu"
            >
              <Image
                src={avatarSrc}
                alt="User avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-brand-border bg-brand-sidebar shadow-md">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-brand-text hover:bg-brand-input"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="container mx-auto p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ChartCard title="Total Categories">
            <BarChart data={categoriesData} labels={categoriesLabels} />
          </ChartCard>

          <ChartCard title="Total Cost">
            <LineChart data={costData} color="#ef4444" />
          </ChartCard>

          <ChartCard title="Sales Trends">
            <LineChart data={salesTrend} color="#22c55e" />
          </ChartCard>
        </div>

        <div className="mt-6">
          <ChartCard>
            <CategoryTable />
          </ChartCard>
        </div>

            <div className="mt-6">
              <ChartCard>
                <BusinessDataTable />
              </ChartCard>
            </div>
      </main>
    </div>
  );
}
