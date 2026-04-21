"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  BarChart2,
  SlidersHorizontal,
  Bookmark,
  Gift,
  User,
  Settings,
  HelpCircle,
  Star,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, group: "main" },
  { href: "/jobs", label: "Jobs", icon: Briefcase, group: "main" },
  { href: "/applications", label: "Applications", icon: FileText, group: "main" },
  { href: "/stats", label: "Stats", icon: BarChart2, group: "main" },
  { href: "/preferences", label: "Preferences", icon: SlidersHorizontal, group: "main" },
  { href: "/saved-searches", label: "Saved Searches", icon: Bookmark, group: "main" },
  { href: "/referrals", label: "Referrals", icon: Gift, group: "account" },
  { href: "/account", label: "Account", icon: User, group: "account" },
  { href: "/settings", label: "Settings", icon: Settings, group: "account" },
  { href: "/help", label: "Help", icon: HelpCircle, group: "support" },
  { href: "/whats-included", label: "What's Included", icon: Star, group: "support" },
];

function NavLink({
  item,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0];
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-yellow-50 text-yellow-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={16} className="flex-shrink-0" />
      {item.label}
      {active && <ChevronRight size={14} className="ml-auto text-yellow-500" />}
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { data: session } = useSession();

  const mainItems = NAV_ITEMS.filter((i) => i.group === "main");
  const accountItems = NAV_ITEMS.filter((i) => i.group === "account");
  const supportItems = NAV_ITEMS.filter((i) => i.group === "support");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-xl text-gray-900">MineApply</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Jobs
          </p>
          <div className="space-y-0.5">
            {mainItems.map((item) => (
              <NavLink key={item.href} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Account
          </p>
          <div className="space-y-0.5">
            {accountItems.map((item) => (
              <NavLink key={item.href} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Support
          </p>
          <div className="space-y-0.5">
            {supportItems.map((item) => (
              <NavLink key={item.href} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <span className="text-yellow-700 font-semibold text-xs">
              {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut size={16} className="flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col lg:hidden transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-lg text-gray-900">MineApply</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
