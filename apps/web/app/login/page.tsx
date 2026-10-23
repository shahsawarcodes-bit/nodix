"use client";

import { useState, type ReactElement, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth";
import { NodixLogo } from "@/features/editor";

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const identifier = activeTab === "email" ? email.trim() : phone.trim();

    if (!identifier || !password.trim()) {
      setError(`Please enter your ${activeTab === "email" ? "email address" : "phone number"} and password`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(identifier, password);
      router.push("/workspace");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent): void => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 4000);
  };

  return (
    <div className="min-h-screen w-full flex bg-white select-none">
      {/* Left Column: Nodix Brand Illustration (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F5F8F9] flex-col justify-between p-8 xl:p-12 border-r border-gray-100 relative overflow-hidden">
        {/* Top Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-85 transition-opacity">
            <NodixLogo className="h-8" />
          </Link>
        </div>

        {/* Center Illustration matching reference */}
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="relative w-full max-w-[480px]">
            <Image
              src="/auth-illustration.png"
              alt="Nodix visual workspace illustration"
              width={503}
              height={475}
              priority
              className="w-full h-auto object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* Bottom subtle note / placeholder */}
        <div className="text-xs text-gray-400">
          © {new Date().getFullYear()} Nodix Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-10 py-12">
        <div className="w-full max-w-[410px]">
          {/* Mobile Logo Only */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link href="/" className="hover:opacity-85 transition-opacity">
              <NodixLogo className="h-8" />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#111827] tracking-tight text-center leading-tight">
            Welcome to Nodix!
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2.5 mb-8 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            An all-in-one visual workspace for your tasks, docs, and teams.
          </p>

          {/* Tab Switcher: Email vs Phone */}
          <div className="relative flex justify-center border-b border-gray-200 mb-7">
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={`relative px-7 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "email" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Email
              {activeTab === "email" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#53549E] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("phone")}
              className={`relative px-7 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === "phone" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Phone
              {activeTab === "phone" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#53549E] rounded-full" />
              )}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="w-full mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Forgot Password Notification */}
          {forgotSent && (
            <div className="w-full mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>If an account exists for this address, a reset link will be sent shortly.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="w-full space-y-4">
            {activeTab === "email" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@work.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1974EC]/20 focus:border-[#1974EC] text-gray-900 placeholder:text-gray-400 transition-all shadow-2xs"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="phone">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1974EC]/20 focus:border-[#1974EC] text-gray-900 placeholder:text-gray-400 transition-all shadow-2xs"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1974EC]/20 focus:border-[#1974EC] text-gray-900 placeholder:text-gray-400 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-[#1974EC] focus:ring-[#1974EC]/30 accent-[#1974EC] cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs sm:text-sm font-medium text-[#1974EC] hover:text-blue-700 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-[#1974EC] hover:bg-[#1565C0] active:scale-[0.99] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-8 text-center text-xs sm:text-sm text-gray-600">
            First time here?{" "}
            <Link
              href="/signup"
              className="text-gray-900 font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              Sign up
            </Link>{" "}
            instead.
          </p>
        </div>
      </div>
    </div>
  );
}
