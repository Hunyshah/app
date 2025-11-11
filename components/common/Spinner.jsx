"use client";

export default function Spinner({ className = "", sizeClass = "w-5 h-5" }) {
  return (
    <div className={`flex justify-center items-center mb-2 ${className}`}>
      <div className={`loader border-t-2 border-b-2 border-white-500 rounded-full animate-spin ${sizeClass}`} />
    </div>
  );
}

export const InlineSpinner = ({ className = "", sizeClass = "w-5 h-5" }) => (
  <div className={`loader border-t-2 border-b-2 border-white-500 rounded-full animate-spin ${sizeClass} ${className}`} />
);