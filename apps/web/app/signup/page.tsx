"use client";

import { useState, type ReactElement, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth";
import { NodixLogo } from "@/features/editor";

export default function SignupPage(): ReactElement {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(name.trim(), email.trim(), password);
      router.push("/workspace");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

        {/* Bottom subtle copyright */}
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

          {/* Error Alert */}
          {error && (
            <div className="w-full mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1974EC]/20 focus:border-[#1974EC] text-gray-900 placeholder:text-gray-400 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@work.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1974EC]/20 focus:border-[#1974EC] text-gray-900 placeholder:text-gray-400 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            {/* Terms and Privacy notice */}
            <p className="text-xs text-gray-500 leading-normal pt-1">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-[#1974EC] hover:bg-[#1565C0] active:scale-[0.99] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Sign up</span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-8 text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-gray-900 font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              Sign in
            </Link>{" "}
            instead.
          </p>
        </div>
      </div>
    </div>
  );
}
