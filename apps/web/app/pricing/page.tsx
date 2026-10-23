"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import {
  Check,
  HelpCircle,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { NodixLogo } from "@/features/editor";

interface PricingPlan {
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  highlighted?: boolean;
  ctaText: string;
  ctaHref: string;
  features: string[];
}

const PLANS: PricingPlan[] = [
  {
    name: "Free",
    description: "Essential block editing and simple note taking for individuals.",
    monthlyPrice: 0,
    annualPrice: 0,
    ctaText: "Get started free",
    ctaHref: "/signup",
    features: [
      "Up to 5 pages",
      "Unlimited blocks & headings",
      "Real-time guest view sharing",
      "Single workspace owner",
      "Offline cache support",
      "Export to Markdown"
    ]
  },
  {
    name: "Pro",
    badge: "Most Popular",
    description: "Full real-time collaboration with live cursors and unlimited pages.",
    monthlyPrice: 10,
    annualPrice: 8,
    highlighted: true,
    ctaText: "Start 14-day Pro trial",
    ctaHref: "/signup",
    features: [
      "Unlimited pages & subpages",
      "Real-time Yjs collaboration",
      "Live multi-user cursors & presence",
      "Image & file attachments",
      "Templates library access",
      "Version history snapshots",
      "Up to 10 page collaborators",
      "Priority customer support"
    ]
  },
  {
    name: "Team",
    description: "Advanced workspace controls, permissions, and unlimited team seats.",
    monthlyPrice: 18,
    annualPrice: 15,
    ctaText: "Upgrade to Team",
    ctaHref: "/signup",
    features: [
      "Everything in Pro plan",
      "Unlimited collaborators & guests",
      "Granular role-based permissions",
      "Custom workspace branding",
      "Centralized billing & admin panel",
      "99.9% uptime SLA",
      "Dedicated onboarding manager"
    ]
  }
];

const FAQS = [
  {
    q: "Can I use Nodix for free?",
    a: "Yes! The Free plan gives you access to core block editor features, multiple heading styles, and page sharing with zero credit card required."
  },
  {
    q: "How does real-time collaboration work in Nodix?",
    a: "Nodix uses high-performance Yjs CRDTs paired with WebSockets. When you and your teammates edit together, typing, cursor movements, and block reorganization sync instantly with zero conflict."
  },
  {
    q: "Can I cancel or switch plans anytime?",
    a: "Absolutely. You can upgrade, downgrade, or cancel your subscription anytime directly from your workspace billing settings."
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data transmissions are encrypted via SSL/TLS and saved with automated version snapshots."
  }
];

export default function PricingPage(): ReactElement {
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-85 transition-opacity">
            <NodixLogo className="h-7" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[13.5px] font-medium text-gray-600 hover:text-gray-950 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="text-[13.5px] font-medium text-gray-600 hover:text-gray-950 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-all shadow-xs"
            >
              Get Started
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 max-w-[1140px] mx-auto px-5 sm:px-8 py-16 sm:py-20 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-4">
            <Sparkles className="size-3.5" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 tracking-tight mb-4">
            Choose the plan that fits your ambition.
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Start free, then scale up as your team and document workspace grow.
          </p>

          {/* Toggle Monthly / Annual */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-gray-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                !annualBilling
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                annualBilling
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>Annual billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Pricing Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {PLANS.map((plan) => {
            const price = annualBilling ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-[#181C28] text-white shadow-xl ring-2 ring-blue-500 scale-[1.02]"
                    : "bg-white text-gray-900 border border-gray-200/90 shadow-xs hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">{plan.name}</h3>
                  <p
                    className={`text-sm mb-6 ${
                      plan.highlighted ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                      ${price}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        plan.highlighted ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      / user / month
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className={`size-4 shrink-0 mt-0.5 ${
                            plan.highlighted ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <span
                          className={plan.highlighted ? "text-gray-200" : "text-gray-700"}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaHref as any}
                  className={`w-full py-3 px-4 rounded-xl text-center text-sm font-semibold transition-all shadow-xs ${
                    plan.highlighted
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
                      : "bg-gray-950 hover:bg-gray-800 text-white"
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </div>
            );
          })}
        </div>

        {/* ── FAQ Section ── */}
        <div className="max-w-3xl mx-auto pt-8 border-t border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-sm sm:text-base font-semibold text-gray-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-gray-700" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500">
        <div className="max-w-[1140px] mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NodixLogo className="h-6" />
            <span>© {new Date().getFullYear()} Nodix Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href={"/pricing" as any} className="hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
