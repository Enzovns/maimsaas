"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function LogoLink() {
  const { status } = useSession();
  const href = status === "authenticated" ? "/dashboard" : "/";

  return (
    <Link href={href} className="flex items-center gap-2 flex-shrink-0">
      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">M</span>
      </div>
      <span className="font-bold text-xl text-gray-900">MineApply</span>
    </Link>
  );
}
