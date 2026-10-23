"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  Check,
  Layers,
  Zap,
  Shield,
  FileText,
  Calendar,
  Kanban,
  Database,
  Plus,
  CheckCircle2,
  Search
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { NodixLogo } from "@/features/editor";

/* ─────────── Pricing data ─────────────────────────────────────────── */
const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for personal notes and solo projects.",
    accent: "#6B7280",
    bg: "bg-white",
    border: "border-gray-200",
    textAccent: "text-gray-700",
    badgeBg: "bg-gray-100",
    features: [
      "Up to 5 pages",
      "All basic block types",
      "Guest view sharing",
      "1 workspace member",
      "IndexedDB offline mode",
    ],
    cta: "Start for free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$8",
    period: "/ month",
    desc: "For power users who need unlimited space and live collaboration.",
    accent: "#2563EB",
    bg: "bg-[#1a1f36]",
    border: "border-[#2563EB]/40",
    textAccent: "text-blue-400",
    badgeBg: "bg-blue-500/10",
    features: [
      "Unlimited pages",
      "All block types (images, files, code)",
      "Real-time collaboration (Yjs)",
      "Live cursors & presence",
      "Version snapshots",
      "Up to 10 team members",
    ],
    cta: "Get started",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$15",
    period: "/ member / month",
    desc: "For growing teams that need advanced controls and security.",
    accent: "#7C3AED",
    bg: "bg-white",
    border: "border-gray-200",
    textAccent: "text-purple-600",
    badgeBg: "bg-purple-50",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Admin & role controls",
      "Custom domain sharing",
      "Priority support",
      "SSO & audit logs",
    ],
    cta: "Contact sales",
    href: "#contact",
    highlighted: false,
  },
];

/* ─────────── Cursor SVG ────────────────────────────────────────────── */
const CursorSVG = ({ color }: { color: string }): ReactElement => (
  <svg
    width="20"
    height="24"
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: `drop-shadow(0 2px 4px ${color}60)` }}
  >
    <path
      d="M3 2L3 18.5L7.5 14.5L11 21.5L13.5 20.5L10 13.5L16 13.5L3 2Z"
      fill={color}
      stroke="white"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─────────── Main Component ────────────────────────────────────────── */
export default function LandingPage(): ReactElement {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/workspace");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* ── 1. NAVBAR ─────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
        }`}
      >
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 h-[62px] flex items-center justify-between gap-4">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center hover:opacity-85 transition-opacity shrink-0">
            <NodixLogo className="h-8" />
          </Link>

          {/* Center: Nav (desktop) — minimal, Node-style */}
          <nav className="hidden md:flex items-center gap-0.5">
            {["Features", "Pricing", "Templates"].map((label) => (
              <a
                key={label}
                href={label === "Pricing" ? "#pricing" : label === "Features" ? "#features" : "#templates"}
                className="px-4 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-950 rounded-lg hover:bg-gray-100/70 transition-all"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="text-[13.5px] font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100/60 transition-all"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
            >
              {isAuthenticated ? "Open Workspace" : "Get Started — it's free"}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-5 py-5 border-t border-gray-100 bg-white space-y-3 shadow-lg">
            {["Features", "Pricing", "Templates"].map((l) => (
              <a key={l} href={l === "Pricing" ? "#pricing" : `#${l.toLowerCase()}`}
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-1.5"
                onClick={() => setMobileMenuOpen(false)}
              >{l}</a>
            ))}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <Link href="/login" className="block w-full py-2.5 text-sm font-medium text-gray-700 text-center rounded-xl border border-gray-200 hover:border-gray-400 transition-colors">Log in</Link>
              <Link href="/signup" className="block w-full py-2.5 text-sm font-semibold text-white text-center rounded-xl bg-gray-950 hover:bg-gray-800 transition-colors">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-14 sm:pt-28 sm:pb-20 text-center overflow-hidden">
        {/* Subtle radial bg glow */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden" aria-hidden>
          <div className="w-[900px] h-[500px] rounded-full bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-transparent blur-3xl -translate-y-24 opacity-80" />
        </div>

        {/* Badge pill */}
        <div className="anim-fade-in-up-1 relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12.5px] font-medium bg-white border border-gray-200 text-gray-700 mb-7 shadow-sm hover:shadow hover:border-gray-300 transition-all cursor-default">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gray-500">Introducing</span>
          <span className="font-semibold text-gray-900">Nodix Workspace</span>
          <span className="text-gray-300">·</span>
          <span className="text-blue-600 font-semibold">Real-time collaboration →</span>
        </div>

        {/* Main headline */}
        <h1 className="anim-fade-in-up-2 text-[2.6rem] sm:text-[3.4rem] md:text-[4rem] font-extrabold tracking-tight text-gray-950 leading-[1.09] mb-6 px-4 max-w-4xl mx-auto">
          Connect your ideas, tasks,
          <br className="hidden sm:block" />
          {" "}and teams in one visual{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
            workspace.
          </span>
        </h1>

        {/* Subheading */}
        <p className="anim-fade-in-up-3 text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-11 leading-relaxed px-4">
          Block-based docs meet live collaboration — write, plan, and track
          everything together with your team in real-time.
        </p>

        {/* CTA + animated cursors */}
        <div className="anim-fade-in-up-4 relative inline-block mb-14">
          {/* Cursor: Sarah (purple, left) — ANIMATED via CSS */}
          <div
            className="anim-cursor-sarah absolute pointer-events-none select-none z-20"
            style={{ top: "-36px", left: "-70px" }}
          >
            <div className="flex items-start gap-1.5">
              <CursorSVG color="#8B5CF6" />
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8B5CF6] text-white shadow-md whitespace-nowrap -mt-0.5">
                Sarah
              </span>
            </div>
          </div>

          {/* Cursor: Marcus (green, right) — ANIMATED via CSS */}
          <div
            className="anim-cursor-marcus absolute pointer-events-none select-none z-20"
            style={{ top: "-30px", right: "-76px" }}
          >
            <div className="flex items-start gap-1.5">
              <CursorSVG color="#10B981" />
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#10B981] text-white shadow-md whitespace-nowrap -mt-0.5">
                Marcus
              </span>
            </div>
          </div>

          {/* Main CTA button */}
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-lg hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-200 hover:-translate-y-0.5"
          >
            Get started for free
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Black cursor at bottom-right of button (static) */}
          <div className="absolute -bottom-3 -right-5 pointer-events-none select-none z-20 opacity-70">
            <CursorSVG color="#111827" />
          </div>
        </div>

        {/* Social proof logos */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[12px] font-medium text-gray-400 select-none px-4">
          <span>Loved by teams at</span>
          <div className="flex items-center gap-5 opacity-55 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-300">
            {/* GitHub */}
            <svg className="h-4 w-auto" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            {/* Apple */}
            <svg className="h-4 w-auto" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.64-.78 1.08-1.86.96-2.95-.93.04-2.06.62-2.72 1.4-.58.67-1.09 1.77-.95 2.83 1.04.08 2.07-.5 2.71-1.28z"/></svg>
            {/* Stripe */}
            <svg className="h-4 w-auto" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697.4 12.56.4 5.918.4 2.25 3.9 2.25 9.075c0 4.908 3.067 6.945 7.747 8.64 2.445.894 3.277 1.545 3.277 2.49 0 .963-.846 1.448-2.28 1.448-1.995 0-4.995-1.065-6.96-2.175l-.945 5.58C4.545 25.68 7.62 26.4 10.95 26.4c6.885 0 10.8-3.405 10.8-8.865 0-5.1-3.21-6.99-7.774-8.385z"/></svg>
            {/* Microsoft */}
            <svg className="h-4 w-auto" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h11.4v11.4H0zm12.6 0H24v11.4H12.6zM0 12.6h11.4V24H0zm12.6 0H24V24H12.6z"/></svg>
          </div>
        </div>
      </section>

      {/* ── 3. APP PREVIEW MOCKUP ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div
          className="relative rounded-2xl border border-gray-200/80 bg-white overflow-hidden"
          style={{ boxShadow: "0 32px 80px -12px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)" }}
        >
          {/* Window chrome */}
          <div className="h-10 bg-[#F5F5F3] border-b border-gray-200 px-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-[#FF5F57]" />
              <div className="size-3 rounded-full bg-[#FFBD2E]" />
              <div className="size-3 rounded-full bg-[#28CA41]" />
            </div>
            <div className="flex items-center gap-2 text-[11.5px] font-semibold text-gray-600">
              <span>🚀</span>
              <span>Product Launch Roadmap</span>
            </div>
            <div className="flex items-center -space-x-1.5">
              {["#7C3AED","#059669","#2563EB"].map((c, i) => (
                <div key={i} className="size-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] border-2 border-white" style={{ backgroundColor: c }}>
                  {["S","M","A"][i]}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex min-h-[440px]">
            {/* Sidebar */}
            <div className="w-[200px] bg-[#FAFAF8] border-r border-gray-200/80 p-3 space-y-3 hidden md:flex md:flex-col justify-between shrink-0">
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10.5px] font-semibold text-gray-400 flex items-center gap-1.5">
                  <Layers className="size-3" />
                  <span>Workspace</span>
                </div>
                <div className="space-y-px">
                  {[
                    { icon: <FileText className="size-3.5 text-blue-500" />, label: "Docs & Meeting Notes", active: true },
                    { icon: <Calendar className="size-3.5 text-gray-400" />, label: "Project Roadmap", active: false },
                    { icon: <Kanban className="size-3.5 text-gray-400" />, label: "Tasks & Kanban", active: false },
                    { icon: <Database className="size-3.5 text-gray-400" />, label: "Live databases", active: false },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11.5px] font-medium transition-colors ${item.active ? "bg-gray-200/80 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}>
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-1.5 bg-white border border-gray-200 rounded-md text-[10.5px] text-gray-400 flex items-center gap-1.5 shadow-2xs">
                <Search className="size-3" />
                <span>Quick search</span>
              </div>
            </div>

            {/* Main area */}
            <div className="flex-1 p-7 bg-white">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2 mb-1">
                  <span>🚀</span> Product Launch Roadmap
                </h2>
                <p className="text-[13px] text-gray-400 font-medium">Team release goals for Q4 and beyond:</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2.5 text-[13px] text-gray-700">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span className="line-through text-gray-400">Outline target deliverables</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-gray-700">
                  <div className="size-4 rounded border-2 border-blue-500 flex items-center justify-center shrink-0">
                    <div className="size-1.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="font-medium">Draft feature specifications &amp; schema</span>
                </div>
              </div>

              <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="col-span-5">Task</div>
                  <div className="col-span-2 text-center">Owner</div>
                  <div className="col-span-3">Timeline</div>
                  <div className="col-span-2 text-center">Status</div>
                </div>
                <div className="divide-y divide-gray-100/80 text-[12.5px]">
                  {[
                    { task: "Design wireframes", owner: "SJ", color: "#6366F1", bar: "#6366F1", date: "Oct 14–22", status: "Working on it", statusColor: "#FDAB3D" },
                    { task: "Content draft & docs", owner: "ML", color: "#059669", bar: "#10B981", date: "Oct 18–25", status: "Done", statusColor: "#00C875" },
                    { task: "Backend API integration", owner: "AJ", color: "#E11D48", bar: "#3B82F6", date: "Oct 22–30", status: "Blocked", statusColor: "#E2445C" },
                  ].map((row) => (
                    <div key={row.task} className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-gray-50/60 transition-colors">
                      <div className="col-span-5 flex items-center gap-2 font-medium text-gray-800">
                        <div className="w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                        {row.task}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <div className="size-6 rounded-full flex items-center justify-center font-bold text-[9px] text-white" style={{ backgroundColor: row.color }}>
                          {row.owner}
                        </div>
                      </div>
                      <div className="col-span-3 pr-3">
                        <div className="h-4.5 rounded-full text-[9px] text-white font-semibold flex items-center justify-center px-2" style={{ backgroundColor: row.bar }}>
                          {row.date}
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold text-white" style={{ backgroundColor: row.statusColor }}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-4 py-1.5 flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 bg-gray-50/50 cursor-pointer transition-colors">
                  <Plus className="size-3" /> Add task
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURES ───────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-5">
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-4">
            Designed for clarity,<br />built for teams
          </h2>
          <p className="text-base text-gray-500 leading-relaxed">
            Everything your team needs to capture ideas, manage projects, and deliver results — in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Layers className="size-5" />,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
              title: "Block-Based Docs",
              desc: "Drag-and-drop headings, images, code, todos, toggles, and more. Infinitely nestable, like Notion.",
              tag: "Documents",
            },
            {
              icon: <Zap className="size-5" />,
              iconBg: "bg-violet-50",
              iconColor: "text-violet-600",
              title: "Real-Time Collaboration",
              desc: "See live cursors, co-edit blocks simultaneously with Yjs CRDT. Offline changes sync when you reconnect.",
              tag: "Live Collab",
            },
            {
              icon: <Shield className="size-5" />,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
              title: "Secure & Permissioned",
              desc: "Fine-grained sharing: full access, can edit, can comment, or view-only. JWT auth with guest links.",
              tag: "Security",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative p-7 rounded-2xl border border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-default overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.06) 0%, transparent 70%)" }}
              />
              <div className={`size-11 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-5 shadow-sm`}>
                {card.icon}
              </div>
              <div className="inline-flex px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 rounded mb-3">
                {card.tag}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-gray-100">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 mb-5">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-gray-500">
            Start free, upgrade when your team grows. No surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${plan.bg} ${plan.border} ${
                plan.highlighted
                  ? "shadow-2xl shadow-blue-900/20 md:scale-[1.03] z-10 ring-1 ring-blue-500/30"
                  : "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-md" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                  Most Popular ✦
                </div>
              )}

              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mb-5 self-start ${plan.badgeBg} ${plan.textAccent}`}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: plan.accent }} />
                {plan.name}
              </div>

              <div className={`mb-1 ${plan.highlighted ? "text-white" : "text-gray-950"}`}>
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className={`text-sm ml-1 ${plan.highlighted ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</span>
              </div>
              <p className={`text-[13px] mb-7 leading-relaxed ${plan.highlighted ? "text-blue-200/80" : "text-gray-500"}`}>
                {plan.desc}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <Check
                      className={`size-4 shrink-0 mt-px ${plan.highlighted ? "text-blue-400" : "text-emerald-500"}`}
                    />
                    <span className={plan.highlighted ? "text-blue-100" : "text-gray-700"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href as any}
                className={`block w-full py-2.5 text-center rounded-xl text-[13.5px] font-bold transition-all duration-150 ${
                  plan.highlighted
                    ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30"
                    : "bg-gray-950 hover:bg-gray-800 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[12.5px] text-gray-400 mt-10">
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </section>

      {/* ── 6. FOOTER ─────────────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-gray-200/80 bg-[#FAFAF8] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <NodixLogo className="h-7" />
            <span className="text-[12.5px] text-gray-400">© 2026 Nodix, Inc.</span>
          </div>
          <div className="flex items-center gap-6 text-[12.5px] text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-gray-900 transition-colors">Terms</a>
            <Link href="/login" className="hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
