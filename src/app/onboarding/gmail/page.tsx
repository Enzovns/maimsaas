"use client";

import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingSteps } from "@/components/OnboardingSteps";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

function GmailPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  function handleConnect() {
    window.location.href = "/api/gmail/connect";
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <OnboardingSteps current={2} />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Connect your Gmail
        </h1>
        <p className="text-gray-600">
          We need access to send emails on your behalf. Your CV will be sent
          from your own Gmail address.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-6">
          <AlertCircle size={18} />
          <span className="text-sm">
            {error === "access_denied"
              ? "Gmail access was denied. Please try again."
              : "Failed to connect Gmail. Please try again."}
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="text-red-500" size={32} />
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Gmail Authorization
        </h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Clicking below will redirect you to Google to authorize MineApply to
          send emails from your account.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            We only request permission to:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
              Send emails on your behalf
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
              View your email address
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            We never read, store or share your emails.
          </p>
        </div>

        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl py-3 px-4 text-gray-700 font-medium transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
            <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 014.5 7.5V5.43H1.83a8 8 0 000 7.12L4.5 10.48z" />
            <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54A8 8 0 001.83 5.43L4.5 7.5a4.77 4.77 0 014.48-3.92z" />
          </svg>
          Connect Gmail Account
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already connected?{" "}
        <button
          onClick={() => router.push("/onboarding/upload")}
          className="text-yellow-600 font-medium hover:underline"
        >
          Skip to next step
        </button>
      </p>
    </div>
  );
}

export default function GmailPage() {
  return (
    <Suspense>
      <GmailPageContent />
    </Suspense>
  );
}
