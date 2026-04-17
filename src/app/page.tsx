import Link from "next/link";
import {
  CheckCircle,
  Zap,
  Mail,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MineApply</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-sm text-yellow-800 font-medium mb-8">
            <Zap size={14} />
            Automated for Australian Mining Jobs
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your CV. Sent to{" "}
            <span className="text-yellow-500">20+ mining companies</span> every
            single day.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            MineApply automatically sends your CV to top Australian mining
            company HR departments every morning. Upload once, apply
            everywhere — effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors w-full sm:w-auto"
            >
              Start for $9.99/month
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 px-8 py-4 text-lg font-medium"
            >
              See how it works →
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No contracts. Cancel anytime.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">20+</div>
            <div className="text-gray-600">Mining companies targeted daily</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">8am</div>
            <div className="text-gray-600">Sent every morning AWST, fresh and timely</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
            <div className="text-gray-600">Per month, everything included</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get started in minutes
            </h2>
            <p className="text-xl text-gray-600">
              Four simple steps and your CV starts reaching hiring managers across Australia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sign up & pay",
                desc: "Create your account and subscribe for $9.99/month.",
                icon: Users,
              },
              {
                step: "2",
                title: "Connect Gmail",
                desc: "Link your Gmail so we can send emails on your behalf.",
                icon: Mail,
              },
              {
                step: "3",
                title: "Upload your CV",
                desc: "Upload your PDF CV once. We store it securely.",
                icon: Shield,
              },
              {
                step: "4",
                title: "Sit back & apply",
                desc: "We send your CV to 20+ HR contacts every morning.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-yellow-600" size={24} />
                </div>
                <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-2">
                  Step {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Automatically sends to 20+ Australian mining company HR emails",
              "Professional cold outreach email template with your CV attached",
              "Real-time dashboard showing today's send count and history",
              "Pause or resume sending anytime from your dashboard",
              "Gmail OAuth — emails come from your own address",
              "Stripe-secured subscription, cancel anytime",
              "Daily sends at 8am AWST for maximum impact",
              "Secure CV storage with easy re-upload",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle className="text-yellow-500 mt-0.5 flex-shrink-0" size={20} />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-600 mb-12">One plan. Everything included.</p>
          <div className="border-2 border-yellow-400 rounded-2xl p-8 bg-white shadow-lg">
            <div className="text-5xl font-bold text-gray-900 mb-2">$9.99</div>
            <div className="text-gray-500 mb-6">per month</div>
            <ul className="text-left space-y-3 mb-8">
              {[
                "Daily CV sending to 20+ companies",
                "Send history & dashboard",
                "Gmail OAuth integration",
                "Unlimited CV re-uploads",
                "Pause / resume anytime",
                "Cancel anytime, no lock-in",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="text-yellow-500 flex-shrink-0" size={18} />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to land your next mining job?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join hundreds of mining professionals who let MineApply do the hard work.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-gray-900">MineApply</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} MineApply. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
