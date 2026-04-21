import Link from "next/link";
import {
  CheckCircle,
  Zap,
  FileText,
  Search,
  Brain,
  Briefcase,
} from "lucide-react";
import { LogoLink } from "@/components/LogoLink";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <LogoLink />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/blog"
              className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2"
            >
              Blog
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-yellow-800 font-medium mb-6 sm:mb-8">
            <Zap size={13} />
            AI-powered job applications for Australian mining
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Daily mining job matches.{" "}
            <span className="text-yellow-500">AI-written applications.</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            MineApply scans for new Australian mining jobs every day, matches them to your
            preferences, then generates a tailored cover letter and CV summary for each one —
            ready to copy and apply in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/auth/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-colors w-full sm:w-auto text-center"
            >
              Start for $9.99/week
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 px-4 py-3 text-base sm:text-lg font-medium"
            >
              See how it works →
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No contracts. Cancel anytime.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 text-center">
          <div>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Daily</div>
            <div className="text-gray-600 text-xs sm:text-base">New jobs scraped from Adzuna</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">AI</div>
            <div className="text-gray-600 text-xs sm:text-base">Cover letter per job match</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">$9.99</div>
            <div className="text-gray-600 text-xs sm:text-base">Per week to start</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How it works
            </h2>
            <p className="text-base sm:text-xl text-gray-600">
              Set your preferences once. Wake up to a fresh set of matched jobs and ready-to-send applications.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                title: "Sign up & choose a plan",
                desc: "Create your account and pick Standard or Pro.",
                icon: Briefcase,
              },
              {
                step: "2",
                title: "Set your preferences",
                desc: "Tell us your preferred roles, states, roster type, and experience level.",
                icon: Search,
              },
              {
                step: "3",
                title: "Upload your CV",
                desc: "Upload your PDF CV once. We read it to personalise every application.",
                icon: FileText,
              },
              {
                step: "4",
                title: "Get daily AI applications",
                desc: "Each morning you'll have a cover letter and CV summary for every new match.",
                icon: Brain,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <item.icon className="text-yellow-600" size={20} />
                </div>
                <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-1 sm:mb-2">
                  Step {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything you need to land the role
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              "Daily job matching from Adzuna — Australia's largest job board",
              "AI cover letter tailored to each specific job and your CV",
              "AI-generated CV summary highlighting the most relevant experience",
              "Filter by state, roster type (FIFO/DIDO/Residential) and experience level",
              "One-click copy for cover letters and CV summaries",
              "Track which jobs you've applied to in your dashboard",
              "New jobs matched every night, fresh applications every morning",
              "Secure CV storage — upload once, power every application",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle className="text-yellow-500 mt-0.5 flex-shrink-0" size={18} />
                <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Simple pricing</h2>
            <p className="text-gray-600">Two plans. No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Standard */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 sm:p-8 bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Standard</h3>
              <p className="text-gray-500 text-sm mb-5">Daily alerts + AI applications</p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-500 ml-1">/ week</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Daily mining job matches",
                  "AI cover letter per match",
                  "AI CV summary per match",
                  "Copy & apply manually",
                  "Application history",
                  "Pause or cancel anytime",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="text-yellow-500 flex-shrink-0" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="block w-full text-center border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 py-3.5 rounded-xl font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-yellow-400 rounded-2xl p-6 sm:p-8 bg-white shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Zap size={11} />
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pro</h3>
              <p className="text-gray-500 text-sm mb-5">Everything + Auto-apply</p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">$24.99</span>
                <span className="text-gray-500 ml-1">/ week</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Standard",
                  "Auto-apply on Seek.com.au",
                  "Priority job matching",
                  "Application tracking dashboard",
                  "Email delivery of daily matches",
                  "Pause or cancel anytime",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="text-yellow-500 flex-shrink-0" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white py-3.5 rounded-xl font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 px-4 sm:px-6 py-14 sm:py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Ready to land your next mining job?
          </h2>
          <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg">
            Stop writing the same cover letter over and over. Let MineApply do it for you.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-8 sm:px-10 py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors w-full sm:w-auto"
          >
            Start for $9.99/week
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-gray-900">MineApply</span>
          </div>
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} MineApply. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
