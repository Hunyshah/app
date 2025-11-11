import Link from "next/link";
import React from "react";

// Minimal primitives to satisfy JSX usage without external UI libraries
export const Button = ({ as: Component = "button", children, className = "", ...props }) => {
  // If rendering as Next Link, ensure it receives href
  if (Component === Link) {
    return (
      <Link className={className} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

export const Dropdown = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const DropdownTrigger = ({ children }) => <>{children}</>;

export const DropdownMenu = ({ children, className = "", ...props }) => (
  <div className={className} role="menu" {...props}>
    {children}
  </div>
);

export const DropdownItem = ({ children, onClick, className = "", ...props }) => (
  <button className={className} type="button" onClick={onClick} {...props}>
    {children}
  </button>
);

export const Avatar = ({ src, alt = "avatar", size = "sm", className = "", ...props }) => {
  const sizeMap = { xs: 24, sm: 32, md: 40, lg: 48 };
  const dim = typeof size === "number" ? size : sizeMap[size] || 32;

  return (
    <img
      alt={alt}
      className={`rounded-full ${className}`}
      height={dim}
      src={src}
      width={dim}
      {...props}
    />
  );
};