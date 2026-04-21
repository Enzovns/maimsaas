"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gift, Copy, Check, Users, Zap } from "lucide-react";

interface ReferralData {
  referralCode: string;
  freeWeeksEarned: number;
  referralCount: number;
}

export default function ReferralsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/user/referral");
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setData(d);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  async function copyLink() {
    if (!data) return;
    const url = `${window.location.origin}/auth/register?ref=${data.referralCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const referralUrl = data ? `${typeof window !== "undefined" ? window.location.origin : "https://mineapply.com.au"}/auth/register?ref=${data.referralCode}` : "";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <p className="text-gray-500 text-sm mt-1">Refer a friend and earn a free week for every subscriber.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center mb-2">
            <Users size={14} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.referralCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Friends referred</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center mb-2">
            <Zap size={14} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.freeWeeksEarned ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Free weeks earned</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift size={18} className="text-yellow-500" />
          <h2 className="font-semibold text-gray-900">Your referral link</h2>
        </div>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralUrl}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none min-w-0"
          />
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-colors flex-shrink-0 ${copied ? "bg-green-50 border-green-200 text-green-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {data?.referralCode && (
          <p className="text-xs text-gray-400 mt-2">
            Your code: <span className="font-mono font-medium text-gray-600">{data.referralCode}</span>
          </p>
        )}
      </div>

      {/* How it works */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <h3 className="font-semibold text-yellow-900 mb-3">How it works</h3>
        <div className="space-y-2">
          {[
            "Share your referral link with a friend.",
            "They sign up and subscribe to any MineApply plan.",
            "You automatically earn one free week of MineApply.",
            "No limit — refer 4 friends, get a free month!",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-yellow-800">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
