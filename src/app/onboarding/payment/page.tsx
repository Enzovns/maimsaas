"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingSteps } from "@/components/OnboardingSteps";
import { CheckCircle, AlertCircle, Zap } from "lucide-react";

const STANDARD_FEATURES = [
  "Daily job alerts matched to your preferences",
  "AI-generated cover letter for every match",
  "AI-tailored CV summary for every match",
  "Copy-paste ready applications",
  "30-day application history",
  "Pause or cancel anytime",
];

const PRO_FEATURES = [
  "Everything in Standard",
  "Auto-apply on Seek.com.au",
  "Priority job matching",
  "Application tracking dashboard",
  "Email delivery of daily matches",
];

function PaymentPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const [selectedTier, setSelectedTier] = useState<"standard" | "pro">("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  async function handleSubscribe() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
      <OnboardingSteps current={1} />

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choose your plan
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Get matched to Australian mining jobs daily with AI-generated applications
        </p>
      </div>

      {canceled && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 mb-5 sm:mb-6">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span className="text-sm">Payment was canceled. You can try again below.</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-5 sm:mb-6">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Standard Plan */}
        <button
          onClick={() => setSelectedTier("standard")}
          className={`text-left rounded-2xl border-2 p-5 sm:p-6 transition-all ${
            selectedTier === "standard"
              ? "border-yellow-400 bg-yellow-50 shadow-md"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Standard</h2>
              <p className="text-xs text-gray-500 mt-0.5">Job alerts + AI applications</p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <span className="text-2xl font-bold text-gray-900">$9.99</span>
              <span className="text-gray-500 text-xs">/wk</span>
            </div>
          </div>
          <ul className="space-y-2">
            {STANDARD_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                {f}
              </li>
            ))}
          </ul>
          <div className={`mt-4 w-full h-1 rounded-full ${selectedTier === "standard" ? "bg-yellow-400" : "bg-gray-100"}`} />
        </button>

        {/* Pro Plan */}
        <button
          onClick={() => setSelectedTier("pro")}
          className={`text-left rounded-2xl border-2 p-5 sm:p-6 transition-all relative ${
            selectedTier === "pro"
              ? "border-yellow-400 bg-yellow-50 shadow-md"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap size={11} />
              Most Popular
            </span>
          </div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Pro</h2>
              <p className="text-xs text-gray-500 mt-0.5">Everything + Auto-apply</p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <span className="text-2xl font-bold text-gray-900">$24.99</span>
              <span className="text-gray-500 text-xs">/wk</span>
            </div>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                {f}
              </li>
            ))}
          </ul>
          <div className={`mt-4 w-full h-1 rounded-full ${selectedTier === "pro" ? "bg-yellow-400" : "bg-gray-100"}`} />
        </button>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors min-h-[52px]"
      >
        {loading
          ? "Redirecting to payment..."
          : `Subscribe to ${selectedTier === "pro" ? "Pro" : "Standard"} – $${selectedTier === "pro" ? "24.99" : "9.99"}/week`}
      </button>
      <p className="text-center text-xs text-gray-500 mt-3">
        Secured by Stripe. Cancel anytime from your dashboard.
      </p>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentPageContent />
    </Suspense>
  );
}
