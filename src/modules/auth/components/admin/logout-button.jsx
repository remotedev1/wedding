"use client";

import { logout } from "@/modules/auth/actions/logout";

export function LogoutButton({ children, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => logout()}
      className={`w-full text-left cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
