import Image from "next/image";
import React from "react";

export default function NoData({ description }) {
  return (
    <div className="flex items-center py-5 gap-2 justify-center flex-col">
      <Image
        alt="No Data"
        className="w-full h-auto object-contain"
        height={100}
        src="/assets/images/noData.webp"
        width={100}
      />
      <p className="poppins_medium text-white">{description}</p>
    </div>
  );
}
