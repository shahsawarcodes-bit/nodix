"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { FilePlus } from "lucide-react";
import { useAuth } from "@/features/auth";
import { listPages, Sidebar, useEditor } from "@/features/editor";

export default function WorkspacePage(): ReactElement {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { createNewPage } = useEditor();
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let mounted = true;
    void listPages()
      .then((pages) => {
        if (!mounted) return;
        if (pages.length > 0 && pages[0]) {
          router.replace(`/page/${pages[0].id}`);
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setChecking(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [router, isLoading, isAuthenticated]);

  const handleCreateFirstPage = async (): Promise<void> => {
    try {
      const newPage = await createNewPage("Getting Started");
      router.push(`/page/${newPage.id}`);
    } catch {
      // Error handled in store
    }
  };

  if (isLoading || checking) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-white">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-sm animate-pulse">Loading workspace...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 mb-4 shadow-2xs">
          <FilePlus className="size-8 text-gray-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Nodix</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Your visual workspace for docs, tasks, and teams. Create your first page to start writing.
        </p>
        <button
          type="button"
          onClick={() => void handleCreateFirstPage()}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          Create your first page
        </button>
      </main>
    </div>
  );
}
