"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "When will I get my first job matches?",
    a: "Job matching runs every night at 10pm UTC (8am AWST). After you complete your setup — subscribe, upload your CV, and set your preferences — your first matches will appear the following morning.",
  },
  {
    q: "How does the AI cover letter work?",
    a: "We read your uploaded CV and the job description, then use Claude AI to write a tailored cover letter in first person, under 350 words. It references your real experience and the specific requirements of each job.",
  },
  {
    q: "What jobs does MineApply match?",
    a: "We currently scan Adzuna — Australia's largest job board — for mining and resources jobs. We filter by your preferred roles, states, roster type, and experience level. More sources (Seek, company career pages) are coming soon.",
  },
  {
    q: "Can I change my job preferences?",
    a: "Yes — go to the Preferences page anytime to update your preferred roles, states, roster type, and experience level. Changes take effect at the next nightly matching run.",
  },
  {
    q: "What is the Pro plan?",
    a: "Pro ($24.99/wk) includes everything in Standard plus auto-apply on Seek.com.au (coming soon), priority job matching, and email delivery of your daily matches. Standard ($9.99/wk) gives you daily matches and AI cover letters to copy and apply manually.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Account → Manage / Cancel. You can cancel anytime with no fees. Your access continues until the end of the current billing period.",
  },
  {
    q: "Is my CV data secure?",
    a: "Yes. Your CV is stored encrypted in our database and is only used to generate your cover letters. We never share it with third parties.",
  },
  {
    q: "What is auto-apply?",
    a: "Auto-apply (Pro, coming soon) will automatically submit your application on Seek.com.au using the AI-generated cover letter. You'll be notified each time an application is submitted.",
  },
  {
    q: "Can I pause my subscription?",
    a: "Yes — open the billing portal via Account → Manage / Cancel. Stripe allows you to pause your subscription if you need a break without cancelling entirely.",
  },
  {
    q: "What does the referral program offer?",
    a: "Each friend you refer who subscribes earns you one free week of MineApply. There's no limit — refer 4 friends and get a free month. See the Referrals page for your unique referral link.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help & FAQ</h1>
        <p className="text-gray-500 text-sm mt-1">Answers to the most common questions about MineApply.</p>
      </div>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-start gap-3">
                <HelpCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-gray-900">{faq.q}</span>
              </div>
              {open === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
            </button>
            {open === i && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                <p className="text-sm text-gray-600 leading-relaxed pl-7">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <p className="text-sm text-yellow-800 font-medium mb-1">Still have a question?</p>
        <p className="text-sm text-yellow-700">
          Email us at{" "}
          <a href="mailto:support@mineapply.com.au" className="underline font-medium">
            support@mineapply.com.au
          </a>{" "}
          and we&apos;ll get back to you within 24 hours.
        </p>
      </div>
    </div>
  );
}
