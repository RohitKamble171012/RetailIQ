"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ListOrdered,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    const handleAuthChange = (event: any) => {
      const { email } = event.detail;
      if (email) {
        localStorage.setItem("userEmail", email);
        setUserEmail(email);
      } else {
        localStorage.removeItem("userEmail");
        setUserEmail(null);
      }
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () =>
      window.removeEventListener("authStateChanged", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    window.dispatchEvent(
      new CustomEvent("authStateChanged", { detail: { email: null } })
    );
  };

  const navItem = (href: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition
     ${
       pathname === href
         ? "bg-orange-600 text-white"
         : "text-slate-400 hover:bg-slate-800 hover:text-white"
     }`;

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-r from-slate-900 via-black to-slate-900 text-white fixed">
      {/* Logo */}
      

      {/* Nav */}
      <nav className="p-4 space-y-2">
        <Link href="/seller/dashboard" className={navItem("/seller/dashboard")}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        <Link href="/seller/orders" className={navItem("/seller/orders")}>
          <ListOrdered className="w-5 h-5" />
          Orders
        </Link>

        <Link href="/seller/setup" className={navItem("/seller/setup")}>
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
        {userEmail && (
          <p className="text-xs text-slate-400 truncate mb-3">
            {userEmail}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
