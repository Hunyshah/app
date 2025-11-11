import React from "react";
import { HashLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <HashLoader color="13896D" size={60} />
    </div>
  );
}
