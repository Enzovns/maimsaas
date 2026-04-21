import { CheckCircle, XCircle, Zap } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { label: "Daily job matches from Adzuna", standard: true, pro: true },
  { label: "AI cover letter per match", standard: true, pro: true },
  { label: "AI CV summary per match", standard: true, pro: true },
  { label: "Copy & apply manually", standard: true, pro: true },
  { label: "Application history (30 days)", standard: true, pro: true },
  { label: "Stats & insights dashboard", standard: true, pro: true },
  { label: "Saved searches", standard: true, pro: true },
  { label: "Pause or cancel anytime", standard: true, pro: true },
  { label: "Priority job matching", standard: false, pro: true },
  { label: "Email delivery of daily matches", standard: false, pro: true },
  { label: "Auto-apply on Seek.com.au (coming soon)", standard: false, pro: true },
  { label: "Application tracking dashboard", standard: false, pro: true },
];

export default function WhatsIncludedPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">What&apos;s Included</h1>
        <p className="text-gray-500 text-sm mt-1">Full feature comparison between Standard and Pro.</p>
      </div>

      {/* Pricing header */}
      <div className="grid grid-cols-3 gap-0 mb-2">
        <div className="col-span-1" />
        <div className="bg-white rounded-t-2xl border border-b-0 border-gray-200 p-4 text-center">
          <p className="font-bold text-gray-900">Standard</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$9.99</p>
          <p className="text-xs text-gray-500">/ week</p>
        </div>
        <div className="bg-yellow-500 rounded-t-2xl p-4 text-center relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap size={10} />Popular
            </span>
          </div>
          <p className="font-bold text-white">Pro</p>
          <p className="text-2xl font-bold text-white mt-1">$24.99</p>
          <p className="text-xs text-yellow-100">/ week</p>
        </div>
      </div>

      {/* Feature rows */}
      <div className="rounded-2xl overflow-hidden border border-gray-200">
        {FEATURES.map((f, i) => (
          <div
            key={f.label}
            className={`grid grid-cols-3 gap-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
            <div className="col-span-1 p-3 sm:p-4 text-sm text-gray-700">{f.label}</div>
            <div className="p-3 sm:p-4 flex items-center justify-center border-l border-gray-200">
              {f.standard
                ? <CheckCircle size={16} className="text-green-500" />
                : <XCircle size={16} className="text-gray-300" />}
            </div>
            <div className="p-3 sm:p-4 flex items-center justify-center border-l border-yellow-300 bg-yellow-50/50">
              {f.pro
                ? <CheckCircle size={16} className="text-green-500" />
                : <XCircle size={16} className="text-gray-300" />}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link
          href="/onboarding/payment"
          className="text-center border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 py-3 rounded-xl font-semibold transition-colors text-sm"
        >
          Start Standard
        </Link>
        <Link
          href="/onboarding/payment"
          className="text-center bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
