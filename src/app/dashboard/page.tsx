"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Upload,
  CreditCard,
  AlertCircle,
  CheckCircle,
  LogOut,
  FileText,
  XCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Briefcase,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  gmailConnected: boolean;
  cvPath: string | null;
  cvOriginalName: string | null;
  isActive: boolean;
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  state: string | null;
  salary: string | null;
  url: string;
  source: string;
  postedDate: string | null;
}

interface Application {
  id: string;
  coverLetter: string;
  cvSummary: string;
  status: string;
  createdAt: string;
  jobListing: JobListing;
}

type TabFilter = "generated" | "applied" | "dismissed";
type ExpandView = "cover" | "summary";

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [todayMatchCount, setTodayMatchCount] = useState(0);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<TabFilter>("generated");
  const [expanded, setExpanded] = useState<{ id: string; view: ExpandView } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

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
      setUser({ ...dash.user });
      setTodayMatchCount(dash.todayMatchCount);
      setApplications(jobs.applications ?? []);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchAll();
  }, [status, fetchAll]);

  async function handleCVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Only PDF files are allowed"); return; }
    setError(""); setSuccess(""); setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);
    try {
      const res = await fetch("/api/cv/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setSuccess("CV updated successfully!");
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleGmailDisconnect() {
    if (!confirm("Disconnect Gmail?")) return;
    const res = await fetch("/api/gmail/disconnect", { method: "POST" });
    if (res.ok) { setSuccess("Gmail disconnected."); fetchAll(); }
    else setError("Failed to disconnect Gmail.");
  }

  async function handleBillingPortal() {
    setError("");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to open billing portal"); return; }
    window.location.href = data.url;
  }

  async function updateStatus(appId: string, newStatus: string) {
    setUpdatingIds((s) => new Set(s).add(appId));
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (newStatus === "applied") setSuccess("Marked as applied!");
    } catch {
      setError("Failed to update application status");
    } finally {
      setUpdatingIds((s) => { const n = new Set(s); n.delete(appId); return n; });
    }
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setError("Copy failed — please select and copy manually");
    }
  }

  function toggleExpand(id: string, view: ExpandView) {
    setExpanded((prev) =>
      prev?.id === id && prev?.view === view ? null : { id, view }
    );
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load dashboard.</p>
      </div>
    );
  }

  const isSubscribed = user.subscriptionStatus === "active";
  const isPro = user.subscriptionTier === "pro";

  const filtered = applications.filter((a) => a.status === tab);
  const counts = {
    generated: applications.filter((a) => a.status === "generated").length,
    applied: applications.filter((a) => a.status === "applied").length,
    dismissed: applications.filter((a) => a.status === "dismissed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MineApply</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {isPro && (
              <span className="hidden sm:flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                <Zap size={11} /> Pro
              </span>
            )}
            <span className="text-sm text-gray-600 hidden sm:block truncate max-w-[180px]">
              {user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm whitespace-nowrap min-h-[40px] px-2"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-5">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm flex-1">{error}</span>
            <button onClick={() => setError("")}><XCircle size={16} /></button>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 mb-5">
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm flex-1">{success}</span>
            <button onClick={() => setSuccess("")}><XCircle size={16} /></button>
          </div>
        )}

        {/* Subscription warning */}
        {!isSubscribed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <span className="text-sm text-amber-800 font-medium">
                You need an active subscription to receive daily job matches.
              </span>
            </div>
            <Link
              href="/onboarding/payment"
              className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-center sm:flex-shrink-0 min-h-[40px] flex items-center justify-center"
            >
              Subscribe
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="text-yellow-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">New today</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{todayMatchCount}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 pl-12">matched jobs with AI applications</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isPro ? "bg-yellow-100" : "bg-gray-100"}`}>
                <Zap className={isPro ? "text-yellow-600" : "text-gray-400"} size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Plan</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isPro ? "Pro" : "Standard"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 pl-12">
              {isPro ? "$24.99/wk · Auto-apply enabled" : "$9.99/wk · Copy & apply manually"}
            </p>
          </div>
        </div>

        {/* Matched jobs section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Matched Jobs</h2>
            <span className="text-xs text-gray-500">{applications.length} total (last 30 days)</span>
          </div>

          {/* Tab filter */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
            {(["generated", "applied", "dismissed"] as TabFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "generated" ? "New" : t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                <span className={`text-xs ${tab === t ? "text-yellow-600" : "text-gray-400"}`}>
                  {counts[t]}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 sm:p-16 text-center">
              <Briefcase className="text-gray-200 mx-auto mb-4" size={48} />
              {tab === "generated" ? (
                <>
                  <p className="text-gray-600 font-medium mb-1">No new matches yet</p>
                  <p className="text-gray-400 text-sm">
                    {!user.cvPath
                      ? "Upload your CV to start receiving daily job matches."
                      : "New jobs are matched every night. Check back tomorrow."}
                  </p>
                  {!user.cvPath && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="mt-4 inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Upload size={14} />
                      Upload CV
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-sm">No {tab} applications.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((app) => {
                const job = app.jobListing;
                const isExpanded = expanded?.id === app.id;
                const coverKey = `${app.id}-cover`;
                const summaryKey = `${app.id}-summary`;
                const isUpdating = updatingIds.has(app.id);

                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Job header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                            {isPro && tab === "generated" && (
                              <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                <Zap size={10} />
                                Auto-Apply
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">{job.company}</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="flex-shrink-0" />
                              {job.location}
                              {job.state && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-medium ml-1">
                                  {job.state}
                                </span>
                              )}
                            </span>
                            {job.salary && (
                              <span className="flex items-center gap-1 text-green-700">
                                <DollarSign size={12} className="flex-shrink-0" />
                                {job.salary}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-600 border border-gray-200 hover:border-yellow-300 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 min-h-[36px]"
                        >
                          <ExternalLink size={12} />
                          <span className="hidden sm:inline">View job</span>
                        </a>
                      </div>

                      {/* Expand buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleExpand(app.id, "cover")}
                          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors min-h-[36px] ${
                            isExpanded && expanded?.view === "cover"
                              ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <FileText size={13} />
                          Cover Letter
                          {isExpanded && expanded?.view === "cover"
                            ? <ChevronUp size={13} />
                            : <ChevronDown size={13} />}
                        </button>
                        <button
                          onClick={() => toggleExpand(app.id, "summary")}
                          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors min-h-[36px] ${
                            isExpanded && expanded?.view === "summary"
                              ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <FileText size={13} />
                          CV Summary
                          {isExpanded && expanded?.view === "summary"
                            ? <ChevronUp size={13} />
                            : <ChevronDown size={13} />}
                        </button>

                        {/* Status actions */}
                        {tab === "generated" && (
                          <>
                            <button
                              onClick={() => updateStatus(app.id, "applied")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50 min-h-[36px]"
                            >
                              <Check size={13} />
                              Mark Applied
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, "dismissed")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[36px]"
                            >
                              <XCircle size={13} />
                              <span className="hidden sm:inline">Dismiss</span>
                            </button>
                          </>
                        )}

                        {/* Pro Auto-Apply placeholder */}
                        {isPro && tab === "generated" && (
                          <button
                            disabled
                            title="Auto-apply coming soon"
                            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-yellow-500 text-white opacity-60 cursor-not-allowed min-h-[36px] ml-auto"
                          >
                            <Zap size={13} />
                            Auto-Apply
                            <span className="text-xs bg-yellow-400 px-1.5 rounded-full">Soon</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded cover letter */}
                    {isExpanded && expanded?.view === "cover" && (
                      <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cover Letter</p>
                          <button
                            onClick={() => copyText(app.coverLetter, coverKey)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors min-h-[32px] ${
                              copiedKey === coverKey
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "border-gray-200 text-gray-600 hover:bg-white"
                            }`}
                          >
                            {copiedKey === coverKey ? <Check size={12} /> : <Copy size={12} />}
                            {copiedKey === coverKey ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={app.coverLetter}
                          className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          rows={10}
                        />
                      </div>
                    )}

                    {/* Expanded CV summary */}
                    {isExpanded && expanded?.view === "summary" && (
                      <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CV Summary</p>
                          <button
                            onClick={() => copyText(app.cvSummary, summaryKey)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors min-h-[32px] ${
                              copiedKey === summaryKey
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "border-gray-200 text-gray-600 hover:bg-white"
                            }`}
                          >
                            {copiedKey === summaryKey ? <Check size={12} /> : <Copy size={12} />}
                            {copiedKey === summaryKey ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={app.cvSummary}
                          className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          rows={6}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account section */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* CV */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={18} className="text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900">CV</h3>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${user.cvPath ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {user.cvPath ? "Uploaded" : "Missing"}
              </span>
            </div>
            {user.cvOriginalName && (
              <p className="text-xs text-gray-500 mb-3 truncate">{user.cvOriginalName}</p>
            )}
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
            >
              <Upload size={14} />
              {uploading ? "Uploading..." : user.cvPath ? "Replace CV" : "Upload CV"}
            </button>
          </div>

          {/* Gmail */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={18} className="text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900">Gmail</h3>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${user.gmailConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {user.gmailConnected ? "Connected" : "Optional"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {user.gmailConnected
                ? "Connected for email delivery of matches."
                : "Connect to receive job matches by email."}
            </p>
            {user.gmailConnected ? (
              <button
                onClick={handleGmailDisconnect}
                className="w-full text-sm border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-colors min-h-[44px]"
              >
                Disconnect
              </button>
            ) : (
              <a
                href="/api/gmail/connect"
                className="flex w-full items-center justify-center text-sm bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl font-medium transition-colors min-h-[44px]"
              >
                Connect Gmail
              </a>
            )}
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={18} className="text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900">Plan</h3>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${isSubscribed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {isSubscribed ? (isPro ? "Pro" : "Standard") : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {isSubscribed
                ? isPro
                  ? "$24.99/wk · Auto-apply (coming soon)"
                  : "$9.99/wk · Daily matches + AI cover letters"
                : "No active subscription."}
            </p>
            {isSubscribed ? (
              <button
                onClick={handleBillingPortal}
                className="w-full text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl transition-colors min-h-[44px]"
              >
                Manage / Cancel
              </button>
            ) : (
              <Link
                href="/onboarding/payment"
                className="flex w-full items-center justify-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-medium transition-colors min-h-[44px]"
              >
                Subscribe
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
