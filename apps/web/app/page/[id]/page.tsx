"use client";

import { use, useEffect, useState, Suspense, type ReactElement } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { PageEditor, Sidebar, useEditor } from "@/features/editor";

export interface SinglePageEditorProps {
  params: Promise<{ id: string }>;
}

function PageContent({ pageId }: { pageId: string }): ReactElement {
  const [mounted, setMounted] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentPage } = useEditor();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGuestQuery = searchParams.get("guest") === "true" || searchParams.get("guest") === "1";
  const isGuest = isGuestQuery || !isAuthenticated;
  const isOwner = Boolean(
    user &&
      currentPage &&
      ((currentPage.ownerId && currentPage.ownerId === user.id) || !currentPage.ownerId)
  );

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated && !isGuestQuery && currentPage && currentPage.generalAccess !== "public") {
      router.replace("/login");
    }
  }, [mounted, isLoading, isAuthenticated, isGuestQuery, currentPage, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-white" suppressHydrationWarning>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="min-h-screen w-screen overflow-y-auto bg-white" suppressHydrationWarning>
        <PageEditor pageId={pageId} isGuest={true} />
      </div>
    );
  }

  // Authenticated user who is not the owner: view shared page without the owner's workspace sidebar
  if (!isOwner) {
    return (
      <div className="min-h-screen w-screen overflow-y-auto bg-white" suppressHydrationWarning>
        <PageEditor pageId={pageId} isGuest={false} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white" suppressHydrationWarning>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <PageEditor pageId={pageId} isGuest={false} />
      </main>
    </div>
  );
}

export default function SinglePageEditor({ params }: SinglePageEditorProps): ReactElement {
  const resolvedParams = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-screen flex items-center justify-center bg-white">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      }
    >
      <PageContent pageId={resolvedParams.id} />
    </Suspense>
  );
}

