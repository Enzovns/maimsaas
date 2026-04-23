"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const pwError =
    password.length > 0 && password.length < 8 ? "At least 8 characters required." : "";
  const matchError =
    confirm.length > 0 && password !== confirm ? "Passwords do not match." : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwError || matchError || !password || !confirm) return;
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 text-sm font-medium mb-4">
          Invalid reset link. The link may have expired or already been used.
        </p>
        <Link href="/auth/forgot-password" className="text-yellow-600 font-medium hover:underline text-sm">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={24} />
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">Password updated!</h2>
        <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm mb-4">
          {error}
          {error.includes("expired") || error.includes("Invalid token") ? (
            <div className="mt-2">
              <Link href="/auth/forgot-password" className="underline font-medium">
                Request a new link →
              </Link>
            </div>
          ) : null}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwError && <p className="text-xs text-red-500 mt-1">{pwError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm new password
          </label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
          {matchError && <p className="text-xs text-red-500 mt-1">{matchError}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !!pwError || !!matchError || !password || !confirm}
          className="w-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-colors min-h-[48px]"
        >
          {loading ? "Updating…" : "Set new password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-10 sm:py-0 sm:items-center">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-5 sm:mb-6">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MineApply</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Set new password</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Choose a strong password for your account.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <Suspense fallback={<div className="h-40 animate-pulse bg-gray-50 rounded-xl" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
