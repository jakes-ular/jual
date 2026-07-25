"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SuspendedSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-medium bg-gradient-brand text-white hover:brightness-110 transition-all"
    >
      <LogOut className="h-4 w-4" /> Logout
    </button>
  );
}
