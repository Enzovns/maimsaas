"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Upload, CreditCard, Mail, FileText, AlertCircle, CheckCircle, XCircle,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  name: string;
  email: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  gmailConnected: boolean;
  cvPath: string | null;
  cvOriginalName: string | null;
}

export default function AccountPage() {
  const { status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setError("Failed to load account data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchUser();
  }, [status, fetchUser]);

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
      fetchUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleGmailDisconnect() {
    if (!confirm("Disconnect Gmail?")) return;
    const res = await fetch("/api/gmail/disconnect", { method: "POST" });
    if (res.ok) { setSuccess("Gmail disconnected."); fetchUser(); }
    else setError("Failed to disconnect Gmail.");
  }

  async function handleBillingPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to open billing portal"); return; }
    window.location.href = data.url;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!user) return null;
  const isSubscribed = user.subscriptionStatus === "active";
  const isPro = user.subscriptionTier === "pro";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your CV, Gmail connection, and subscription.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-4">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={() => setError("")}><XCircle size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 mb-4">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span className="text-sm flex-1">{success}</span>
          <button onClick={() => setSuccess("")}><XCircle size={14} /></button>
        </div>
      )}

      <div className="space-y-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Profile</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-16">Name</span>
              <span className="text-gray-900">{user.name || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-16">Email</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
          </div>
        </div>

        {/* CV */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">CV</h2>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.cvPath ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {user.cvPath ? "Uploaded" : "Missing"}
            </span>
          </div>
          {user.cvOriginalName && (
            <p className="text-sm text-gray-500 mb-3">{user.cvOriginalName}</p>
          )}
          <p className="text-xs text-gray-400 mb-3">Your CV is stored securely and used to personalise every cover letter.</p>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            {uploading ? "Uploading…" : user.cvPath ? "Replace CV" : "Upload CV (PDF)"}
          </button>
        </div>

        {/* Gmail */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Gmail</h2>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.gmailConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {user.gmailConnected ? "Connected" : "Not connected"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {user.gmailConnected ? "Your Gmail is connected for email delivery of daily matches." : "Connect your Gmail to receive job matches by email."}
          </p>
          {user.gmailConnected ? (
            <button onClick={handleGmailDisconnect} className="text-sm border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors">
              Disconnect Gmail
            </button>
          ) : (
            <a href="/api/gmail/connect" className="inline-flex items-center gap-2 text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
              Connect Gmail
            </a>
          )}
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Subscription</h2>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isSubscribed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {isSubscribed ? (isPro ? "Pro" : "Standard") : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {isSubscribed
              ? isPro ? "$24.99/wk · Daily matches + AI applications + Auto-apply (coming soon)" : "$9.99/wk · Daily matches + AI cover letters"
              : "No active subscription."}
          </p>
          {isSubscribed ? (
            <button onClick={handleBillingPortal} className="text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-colors">
              Manage / Cancel
            </button>
          ) : (
            <Link href="/onboarding/payment" className="inline-flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
              Subscribe
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
