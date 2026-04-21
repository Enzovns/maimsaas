"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle,
  AlertCircle,
  Zap,
  Clock,
  ArrowRight,
  FileText,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  cvPath: string | null;
  preferredRoles: string[];
}

export default function DashboardOverview() {
  const { status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [todayMatchCount, setTodayMatchCount] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, jobsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/jobs"),
      ]);
      if (!dashRes.ok || !jobsRes.ok) throw new Error("Failed to load");
      const [dash, jobs] = await Promise.all([dashRes.json(), jobsRes.json()]);
      setUser(dash.user);
      setTodayMatchCount(dash.todayMatchCount);
      const apps = jobs.applications ?? [];
      setTotalApplications(apps.length);
      setAppliedCount(apps.filter((a: { status: string }) => a.status === "applied").length);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchAll();
  }, [status, fetchAll]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!user) return null;

  const isSubscribed = user.subscriptionStatus === "active";
  const isPro = user.subscriptionTier === "pro";
  const setupDone = isSubscribed && !!user.cvPath && user.preferredRoles.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning{user.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {setupDone
            ? "Here's your daily mining job summary."
            : "Complete your setup to start receiving job matches."}
        </p>
      </div>

      {/* Subscription warning */}
      {!isSubscribed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <span className="text-sm text-amber-800 font-medium">
              Subscribe to start receiving daily job matches.
            </span>
          </div>
          <Link
            href="/onboarding/payment"
            className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-center"
          >
            Subscribe
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
          <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
            <Briefcase className="text-yellow-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayMatchCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">New today</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <FileText className="text-blue-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total (30 days)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle className="text-green-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{appliedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Applied</p>
        </div>
      </div>

      {/* Setup checklist */}
      {!setupDone && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Complete your setup</h2>
          <div className="space-y-3">
            <ChecklistItem done={isSubscribed} label={isSubscribed ? `${isPro ? "Pro" : "Standard"} plan active` : "Activate a plan"} href={!isSubscribed ? "/onboarding/payment" : undefined} />
            <ChecklistItem done={!!user.cvPath} label={user.cvPath ? "CV uploaded" : "Upload your CV"} href={!user.cvPath ? "/account" : undefined} />
            <ChecklistItem done={user.preferredRoles.length > 0} label={user.preferredRoles.length > 0 ? "Preferences set" : "Set your job preferences"} href={user.preferredRoles.length === 0 ? "/preferences" : undefined} />
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock size={11} className="text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">Daily matching runs at 10pm UTC</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickLink href="/jobs" icon={Briefcase} iconBg="bg-yellow-100" iconColor="text-yellow-600" title="View Job Matches" desc="Browse today's matched jobs and AI applications" />
        <QuickLink href="/applications" icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-600" title="Application History" desc="Search and copy your cover letters" />
        <QuickLink href="/stats" icon={BarChart2} iconBg="bg-purple-100" iconColor="text-purple-600" title="Stats & Insights" desc="Application trends and match history" />
        {isPro ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-yellow-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="text-yellow-700" size={16} />
            </div>
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Auto-Apply (Pro)</p>
              <p className="text-xs text-yellow-700 mt-0.5">Coming soon — we&apos;ll apply on your behalf.</p>
            </div>
          </div>
        ) : (
          <QuickLink href="/whats-included" icon={Zap} iconBg="bg-gray-100" iconColor="text-gray-500" title="Upgrade to Pro" desc="Auto-apply, priority matching, email delivery" />
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ done, label, href }: { done: boolean; label: string; href?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100" : "bg-amber-100"}`}>
        {done ? <CheckCircle size={11} className="text-green-600" /> : <AlertCircle size={11} className="text-amber-600" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
      {href && (
        <Link href={href} className="ml-auto text-xs text-yellow-600 font-medium hover:underline">
          Fix →
        </Link>
      )}
    </div>
  );
}

function QuickLink({ href, icon: Icon, iconBg, iconColor, title, desc }: {
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:border-yellow-200 hover:bg-yellow-50/30 transition-colors group">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-yellow-500 flex-shrink-0 transition-colors" />
    </Link>
  );
}
