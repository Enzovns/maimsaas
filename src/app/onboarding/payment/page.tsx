"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingSteps } from "@/components/OnboardingSteps";
import { CheckCircle, AlertCircle } from "lucide-react";

function PaymentPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  async function handleSubscribe() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16">
      <OnboardingSteps current={1} />

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Subscribe to MineApply
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Get started with your automated CV sending service
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

      <div className="bg-white rounded-2xl border-2 border-yellow-400 shadow-lg p-5 sm:p-8 mb-6">
        <div className="flex items-start justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">MineApply Weekly</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Everything to get hired in mining</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-500 text-sm">/wk</span>
          </div>
        </div>

        <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
          {[
            "Daily CV sending to 20+ Australian mining companies",
            "Professional email template with your CV",
            "Send history & analytics dashboard",
            "Gmail OAuth — emails from your own account",
            "Pause or cancel anytime",
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors min-h-[52px]"
        >
          {loading ? "Redirecting to payment..." : "Subscribe Now – $9.99/week"}
        </button>
        <p className="text-center text-xs text-gray-500 mt-3">
          Secured by Stripe. Cancel anytime from your dashboard.
        </p>
      </div>
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
