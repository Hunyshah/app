import React from "react";

export default function SectionHeading({ heading, otherClasses }) {
  return (
    <>
      <h2
        className={`text-3xl md:text-4xl plusjakarta_semibold capitalize text-brand-black ${otherClasses}`}
      >
        {heading}
      </h2>
    </>
  );
}
