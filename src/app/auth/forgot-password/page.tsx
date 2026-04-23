"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        // Only surface rate-limit errors; everything else → show success anyway
        if (res.status === 429) {
          setError(data.error ?? "Too many requests. Please wait a few minutes.");
          return;
        }
      }
      setSubmitted(true);
    } catch {
      // Network error — still show success to avoid enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h2 className="font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password
                reset link within a few minutes.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-yellow-600 font-medium hover:underline"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-colors min-h-[48px]"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-600 mt-5">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-yellow-600 font-medium hover:underline"
                >
                  <ArrowLeft size={13} />
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
