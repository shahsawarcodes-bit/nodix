"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NodixIcon } from "./NodixLogo";

export interface GuestBannerProps {
  pageId?: string;
}

export const GuestBanner = ({ pageId }: GuestBannerProps): ReactElement => {
  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-2xs px-4 sm:px-6 py-2.5 flex items-center justify-between select-none">
      {/* Left: Brand / Shared Workspace Notice */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/" className="hover:opacity-85 transition-opacity shrink-0" title="Nodix">
          <NodixIcon className="size-4.5 text-gray-900" />
        </Link>
        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
          You&apos;re exploring a shared workspace. Sign up to create your own.
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {pageId && (
          <Link
            href={`/page/${pageId}`}
            className="hidden md:inline-flex text-[11px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded transition-colors"
            title="Switch back to workspace owner mode"
          >
            Exit guest view
          </Link>
        )}

        <Link
          href="/login"
          className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Log in
        </Link>

        <Link
          href="/signup"
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <span>Sign up</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
};
