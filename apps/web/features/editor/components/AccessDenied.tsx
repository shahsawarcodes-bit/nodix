"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Lock, Check, ArrowLeft } from "lucide-react";
import { GuestBanner } from "./GuestBanner";

export interface AccessDeniedProps {
  pageId: string;
}

export const AccessDenied = ({ pageId }: AccessDeniedProps): ReactElement => {
  const [requested, setRequested] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      {/* Sticky Top Guest Banner */}
      <GuestBanner pageId={pageId} />

      {/* Main Access Denied Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 mb-6 shadow-2xs border border-gray-200/60">
          <Lock className="size-8" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          You don&apos;t have access to this page
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          This page is private and has not been shared publicly. Request access from the owner or switch to an invited account.
        </p>

        <div className="w-full space-y-3">
          <button
            type="button"
            disabled={requested}
            onClick={() => setRequested(true)}
            className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer ${
              requested
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {requested ? (
              <>
                <Check className="size-4 text-emerald-600" />
                <span>Access requested</span>
              </>
            ) : (
              <span>Request access</span>
            )}
          </button>

          <Link
            href={`/page/${pageId}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Switch to workspace owner view</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
