import type { Page } from "@workspace/types";
import type { RequestUser } from "../../types/express.js";

export interface PermissionResult {
  allowed: boolean;
  status: 401 | 403;
  message: string;
}

const checkSinglePageEdit = (page: Page, user: RequestUser): PermissionResult => {
  // 1. Owner can always edit
  if ((page.ownerId && page.ownerId === user.id) || !page.ownerId) {
    return { allowed: true, status: 403, message: "" };
  }

  // 2. Check if user is an invited collaborator with edit rights
  if (page.collaborators && page.collaborators.length > 0) {
    const collaborator = page.collaborators.find(
      (c) => c.email.toLowerCase() === user.email.toLowerCase()
    );
    if (collaborator && (collaborator.role === "can_edit" || collaborator.role === "full_access")) {
      return { allowed: true, status: 403, message: "" };
    }
  }

  // 3. Check public general access (only for authenticated users)
  if (page.generalAccess === "public") {
    if (page.publicPermission === "can_edit" || page.publicPermission === "full_access") {
      return { allowed: true, status: 403, message: "" };
    }
    return {
      allowed: false,
      status: 403,
      message: "You have view-only access to this page and cannot make edits."
    };
  }

  return {
    allowed: false,
    status: 403,
    message: "You do not have permission to edit this page."
  };
};

export const canEditPage = async (
  page: Page,
  user?: RequestUser,
  findPageById?: (id: string) => Promise<Page | null>
): Promise<PermissionResult> => {
  // Guests (Unauthenticated) must ALWAYS be Read-Only with 401
  if (!user) {
    return {
      allowed: false,
      status: 401,
      message: "Authentication required to edit this page. Please log in."
    };
  }

  // Check the direct page first
  const directResult = checkSinglePageEdit(page, user);
  if (directResult.allowed) {
    return directResult;
  }

  // Folder Inheritance: If page doesn't grant edit permission, walk up parentId chain
  if (page.parentId && findPageById) {
    let currParentId: string | null = page.parentId;
    const visited = new Set<string>([page.id]);

    while (currParentId && !visited.has(currParentId)) {
      visited.add(currParentId);
      const parentPage = await findPageById(currParentId);
      if (!parentPage) break;

      const parentResult = checkSinglePageEdit(parentPage, user);
      if (parentResult.allowed) {
        return { allowed: true, status: 403, message: "" };
      }
      currParentId = parentPage.parentId ?? null;
    }
  }

  return directResult;
};

const checkSinglePageView = (page: Page, user?: RequestUser): boolean => {
  if (page.generalAccess === "public") {
    return true;
  }
  if (!user) {
    return false;
  }
  if ((page.ownerId && page.ownerId === user.id) || !page.ownerId) {
    return true;
  }
  if (page.collaborators && page.collaborators.length > 0) {
    return page.collaborators.some(
      (c) => c.email.toLowerCase() === user.email.toLowerCase()
    );
  }
  return false;
};

export const canViewPage = async (
  page: Page,
  user?: RequestUser,
  findPageById?: (id: string) => Promise<Page | null>
): Promise<PermissionResult> => {
  if (checkSinglePageView(page, user)) {
    return { allowed: true, status: 403, message: "" };
  }

  // Folder Inheritance: If page doesn't grant view permission, walk up parentId chain
  if (page.parentId && findPageById) {
    let currParentId: string | null = page.parentId;
    const visited = new Set<string>([page.id]);

    while (currParentId && !visited.has(currParentId)) {
      visited.add(currParentId);
      const parentPage = await findPageById(currParentId);
      if (!parentPage) break;

      if (checkSinglePageView(parentPage, user)) {
        return { allowed: true, status: 403, message: "" };
      }
      currParentId = parentPage.parentId ?? null;
    }
  }

  if (!user) {
    return {
      allowed: false,
      status: 401,
      message: "Authentication required to view this private page."
    };
  }

  return {
    allowed: false,
    status: 403,
    message: "You do not have access to this private page."
  };
};

export const canViewPageSync = (
  page: Page,
  user?: RequestUser,
  allPagesMap?: Map<string, Page>
): boolean => {
  if (checkSinglePageView(page, user)) {
    return true;
  }
  if (page.parentId && allPagesMap) {
    let currParentId: string | null = page.parentId;
    const visited = new Set<string>([page.id]);

    while (currParentId && !visited.has(currParentId)) {
      visited.add(currParentId);
      const parentPage = allPagesMap.get(currParentId);
      if (!parentPage) break;

      if (checkSinglePageView(parentPage, user)) {
        return true;
      }
      currParentId = parentPage.parentId ?? null;
    }
  }
  return false;
};
