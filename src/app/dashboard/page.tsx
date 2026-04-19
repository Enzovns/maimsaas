"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Upload,
  Power,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  FileText,
  XCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
    gmailConnected: boolean;
    cvPath: string | null;
    cvOriginalName: string | null;
    isActive: boolean;
  };
  todayCount: number;
  sendLogs: {
    id: string;
    date: string;
    recipientCount: number;
    status: string;
    errorMessage: string | null;
    createdAt: string;
  }[];
  activeCompanyCount: number;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      const d = await res.json();
      setData(d);
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status]);

  async function handleToggle() {
    if (!data) return;
    setError("");
    setSuccess("");
    setToggling(true);

    try {
      const res = await fetch("/api/user/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !data.user.isActive }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setData((prev) =>
        prev ? { ...prev, user: { ...prev.user, isActive: result.isActive } } : prev
      );
      setSuccess(result.isActive ? "CV sending activated!" : "CV sending paused.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setToggling(false);
    }
  }

  async function handleGmailDisconnect() {
    setError("");
    setSuccess("");
    if (!confirm("Disconnect Gmail? CV sending will be paused.")) return;

    const res = await fetch("/api/gmail/disconnect", { method: "POST" });
    if (res.ok) {
      setSuccess("Gmail disconnected.");
      fetchDashboard();
    } else {
      setError("Failed to disconnect Gmail.");
    }
  }

  async function handleCVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setSuccess("CV updated successfully!");
      fetchDashboard();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleBillingPortal() {
    setError("");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to open billing portal");
      return;
    }
    window.location.href = data.url;
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load dashboard.</p>
      </div>
    );
  }

  const { user, todayCount, sendLogs, activeCompanyCount } = data;
  const isSubscribed = user.subscriptionStatus === "active";
  const readyToSend = isSubscribed && user.gmailConnected && !!user.cvPath;

  const statusColor = {
    success: "text-green-600 bg-green-50",
    partial: "text-amber-600 bg-amber-50",
    error: "text-red-600 bg-red-50",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MineApply</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
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
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-5 sm:mb-6">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm flex-1">{error}</span>
            <button onClick={() => setError("")} className="flex-shrink-0">
              <XCircle size={16} />
            </button>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 mb-5 sm:mb-6">
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm flex-1">{success}</span>
            <button onClick={() => setSuccess("")} className="flex-shrink-0">
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* Subscription warning */}
        {!isSubscribed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <span className="text-sm text-amber-800 font-medium">
                You need an active subscription to send CVs.
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

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-5 sm:mb-8">
          {/* Today's sends */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-yellow-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sent today</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayCount}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">
              of {activeCompanyCount} active companies
            </p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  user.isActive ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Power
                  className={user.isActive ? "text-green-600" : "text-gray-400"}
                  size={16}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {user.isActive ? "Active" : "Paused"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggling || !readyToSend}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 min-h-[32px] ${
                user.isActive
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {toggling ? "..." : user.isActive ? "Pause" : "Activate"}
            </button>
          </div>

          {/* Next send */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Next send</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {user.isActive ? "8am" : "Paused"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">Daily at 8am AWST</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Account panels */}
          <div className="lg:col-span-1 space-y-4">
            {/* Gmail */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail size={18} className="text-gray-600 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">Gmail</h3>
                {user.gmailConnected ? (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    Connected
                  </span>
                ) : (
                  <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    Disconnected
                  </span>
                )}
              </div>
              {user.gmailConnected ? (
                <button
                  onClick={handleGmailDisconnect}
                  className="w-full text-sm border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-colors min-h-[44px]"
                >
                  Disconnect Gmail
                </button>
              ) : (
                <a
                  href="/api/gmail/connect"
                  className="block w-full text-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-medium transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Connect Gmail
                </a>
              )}
            </div>

            {/* CV */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText size={18} className="text-gray-600 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">CV</h3>
                {user.cvPath ? (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    Uploaded
                  </span>
                ) : (
                  <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    Missing
                  </span>
                )}
              </div>
              {user.cvPath && (
                <p className="text-xs text-gray-500 mb-3 truncate">
                  {user.cvOriginalName}
                </p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={handleCVUpload}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : user.cvPath ? "Replace CV" : "Upload CV"}
              </button>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard size={18} className="text-gray-600 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">Subscription</h3>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    isSubscribed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.subscriptionStatus || "Inactive"}
                </span>
              </div>
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
                  className="block w-full text-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-medium transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Subscribe – $9.99/wk
                </Link>
              )}
            </div>
          </div>

          {/* Send history */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Last 7 days of sends
              </h3>
              {sendLogs.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <Clock className="text-gray-300 mx-auto mb-3" size={36} />
                  <p className="text-gray-500 text-sm">No send history yet.</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Your first send will appear here after 8am AWST.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {sendLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-gray-50 gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(log.createdAt).toLocaleDateString("en-AU", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        {log.errorMessage && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[160px] sm:max-w-xs">
                            {log.errorMessage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {log.recipientCount} sent
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                            statusColor[log.status as keyof typeof statusColor] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
