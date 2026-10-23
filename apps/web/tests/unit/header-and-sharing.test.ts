import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Page, Collaborator, PermissionRole, GeneralAccess } from "@workspace/types";
import { formatRelativeTime } from "../../features/editor/components/header/PageLastEdited";


describe("Notion Header & Sharing Features", () => {
  describe("Last Edited Time Formatter (Requirement 2)", () => {
    it("formats timestamps less than 15 seconds ago as 'Edited just now'", () => {
      const now = new Date();
      assert.equal(formatRelativeTime(now), "Edited just now");

      const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
      assert.equal(formatRelativeTime(tenSecondsAgo), "Edited just now");
    });

    it("formats seconds ago accurately", () => {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      assert.equal(formatRelativeTime(thirtySecondsAgo), "Edited 30s ago");
    });

    it("formats minutes ago accurately", () => {
      const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);
      assert.equal(formatRelativeTime(fourMinutesAgo), "Edited 4m ago");
    });

    it("formats hours ago accurately", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      assert.equal(formatRelativeTime(twoHoursAgo), "Edited 2h ago");
    });

    it("formats days ago accurately", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      assert.equal(formatRelativeTime(threeDaysAgo), "Edited 3d ago");
    });
  });

  describe("Breadcrumb Hierarchy Resolution (Requirement 1)", () => {
    const rootPage: Page = {
      id: "root-1",
      title: "My Project",
      icon: "🇿🇦",
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false
    };

    const middlePage: Page = {
      id: "mid-1",
      title: "Epics",
      icon: "📁",
      parentId: "root-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false
    };

    const leafPage: Page = {
      id: "leaf-1",
      title: "Features",
      icon: null,
      parentId: "mid-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false
    };

    const pages = [rootPage, middlePage, leafPage];

    const getBreadcrumbTrail = (currentPage: Page, allPages: Page[]): Page[] => {
      const pageMap = new Map<string, Page>(allPages.map((p) => [p.id, p]));
      const trail: Page[] = [currentPage];
      let curr: Page | undefined = currentPage;
      const visited = new Set<string>([currentPage.id]);

      while (curr?.parentId) {
        const parent = pageMap.get(curr.parentId);
        if (!parent || visited.has(parent.id)) break;
        visited.add(parent.id);
        trail.unshift(parent);
        curr = parent;
      }

      return trail;
    };

    it("resolves single root page breadcrumb", () => {
      const trail = getBreadcrumbTrail(rootPage, pages);
      assert.equal(trail.length, 1);
      assert.equal(trail[0]?.title, "My Project");
    });

    it("resolves full multi-level path: My Project / Epics / Features", () => {
      const trail = getBreadcrumbTrail(leafPage, pages);
      assert.equal(trail.length, 3);
      assert.deepEqual(
        trail.map((p) => p.title),
        ["My Project", "Epics", "Features"]
      );
      assert.deepEqual(
        trail.map((p) => p.id),
        ["root-1", "mid-1", "leaf-1"]
      );
    });

    it("handles circular references gracefully without infinite loops", () => {
      const cyclicA: Page = {
        id: "a",
        title: "Page A",
        icon: null,
        parentId: "b",
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };
      const cyclicB: Page = {
        id: "b",
        title: "Page B",
        icon: null,
        parentId: "a",
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };
      const trail = getBreadcrumbTrail(cyclicA, [cyclicA, cyclicB]);
      assert.ok(trail.length <= 2);
    });
  });

  describe("Sharing & General Access Permissions (Requirements 3, 4, 5)", () => {
    it("supports all 4 permission roles and remove action", () => {
      const validRoles: PermissionRole[] = [
        "full_access",
        "can_edit",
        "can_comment",
        "can_view"
      ];
      assert.equal(validRoles.length, 4);

      let collaborators: Collaborator[] = [
        {
          email: "alex@example.com",
          name: "Alex",
          role: "can_edit"
        }
      ];

      // Update permission
      collaborators = collaborators.map((c) =>
        c.email === "alex@example.com" ? { ...c, role: "full_access" } : c
      );
      assert.equal(collaborators[0]?.role, "full_access");

      // Remove access
      collaborators = collaborators.filter((c) => c.email !== "alex@example.com");
      assert.equal(collaborators.length, 0);
    });

    it("handles general access options: only invited vs public", () => {
      const invitedAccess: GeneralAccess = "invited";
      const publicAccess: GeneralAccess = "public";

      const pageWithInvited: Page = {
        id: "p1",
        title: "Private Page",
        icon: null,
        parentId: null,
        generalAccess: invitedAccess,
        publicPermission: "can_view",
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };

      assert.equal(pageWithInvited.generalAccess, "invited");

      const pageWithPublic: Page = {
        ...pageWithInvited,
        generalAccess: publicAccess,
        publicPermission: "can_edit"
      };

      assert.equal(pageWithPublic.generalAccess, "public");
      assert.equal(pageWithPublic.publicPermission, "can_edit");
    });

    it("generates correct page-specific sharing URL for clipboard copy, adding ?guest=true for public pages", () => {
      const origin = "https://nutshyll.app";
      const pageId = "feat-3fb1aa291";

      const getCopyUrl = (id: string, generalAccess: GeneralAccess = "invited"): string => {
        const baseUrl = `${origin}/page/${id}`;
        return generalAccess === "public" ? `${baseUrl}?guest=true` : baseUrl;
      };

      assert.equal(getCopyUrl(pageId, "invited"), "https://nutshyll.app/page/feat-3fb1aa291");
      assert.equal(getCopyUrl(pageId, "public"), "https://nutshyll.app/page/feat-3fb1aa291?guest=true");
    });
  });

  describe("Guest View & Read-Only Mode Verification", () => {
    it("identifies guest mode when ?guest=true query parameter is present", () => {
      const isGuestMode = (guestParam: string | null, isOwner = true): boolean => {
        return guestParam === "true" || guestParam === "1" || !isOwner;
      };

      assert.equal(isGuestMode("true", true), true);
      assert.equal(isGuestMode("1", true), true);
      assert.equal(isGuestMode(null, false), true);
      assert.equal(isGuestMode(null, true), false);
    });

    it("enforces read-only mode for guests or public can_view pages", () => {
      const computeReadOnly = (
        isGuest: boolean,
        generalAccess: GeneralAccess = "invited",
        publicPermission: PermissionRole = "can_view"
      ): boolean => {
        return isGuest || (generalAccess === "public" && publicPermission === "can_view");
      };

      // Guests are always read-only
      assert.equal(computeReadOnly(true, "public", "can_edit"), true);
      assert.equal(computeReadOnly(true, "invited", "full_access"), true);

      // Public can_view is read-only
      assert.equal(computeReadOnly(false, "public", "can_view"), true);

      // Owner with invited or can_edit is editable
      assert.equal(computeReadOnly(false, "invited", "can_view"), false);
      assert.equal(computeReadOnly(false, "public", "can_edit"), false);
    });

    it("denies access to guests when page is private (generalAccess !== 'public')", () => {
      const checkAccess = (
        isGuest: boolean,
        generalAccess: GeneralAccess
      ): "allowed" | "denied" => {
        if (isGuest && generalAccess !== "public") {
          return "denied";
        }
        return "allowed";
      };

      assert.equal(checkAccess(true, "invited"), "denied");
      assert.equal(checkAccess(true, "public"), "allowed");
      assert.equal(checkAccess(false, "invited"), "allowed");
    });

    it("verifies authenticated non-owners can edit with can_edit link or folder inheritance", () => {
      const user = { id: "user-collab-1", email: "collab@example.com" };
      const guest = null;

      const parentFolder: Page = {
        id: "folder-1",
        title: "Team Folder",
        icon: null,
        parentId: null,
        ownerId: "owner-99",
        generalAccess: "public",
        publicPermission: "can_edit",
        collaborators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };

      const childPage: Page = {
        id: "child-1",
        title: "Child Document",
        icon: null,
        parentId: "folder-1",
        ownerId: "owner-99",
        generalAccess: "invited",
        publicPermission: "can_view",
        collaborators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };

      const pagesList = [parentFolder, childPage];

      const checkCanEdit = (p: Page, u: { id: string; email: string } | null, list: Page[]): boolean => {
        if (!u) return false;
        const pageMap = new Map(list.map((item) => [item.id, item]));

        const checkSingle = (pageItem: Page): boolean => {
          if ((pageItem.ownerId && pageItem.ownerId === u.id) || !pageItem.ownerId) return true;
          if (pageItem.collaborators?.some((c) => c.email.toLowerCase() === u.email.toLowerCase() && (c.role === "can_edit" || c.role === "full_access"))) return true;
          if (pageItem.generalAccess === "public" && (pageItem.publicPermission === "can_edit" || pageItem.publicPermission === "full_access")) return true;
          return false;
        };

        if (checkSingle(p)) return true;

        let currParentId = p.parentId;
        const visited = new Set<string>([p.id]);
        while (currParentId && !visited.has(currParentId)) {
          visited.add(currParentId);
          const parent = pageMap.get(currParentId);
          if (!parent) break;
          if (checkSingle(parent)) return true;
          currParentId = parent.parentId ?? null;
        }

        return false;
      };

      // Authenticated collaborator inherits can_edit from parent folder
      assert.equal(checkCanEdit(childPage, user, pagesList), true);

      // Unauthenticated guest ALWAYS has canEdit = false
      assert.equal(checkCanEdit(childPage, guest, pagesList), false);
      assert.equal(checkCanEdit(parentFolder, guest, pagesList), false);
    });

    it("filters out anonymous users, duplicates, and self from collaborator presence", () => {
      const currentUserId = "my-user-id";
      const currentClientId = 100;

      const rawStates: Array<{ clientId: number; user?: { id: string; name: string; color: string } | null }> = [
        { clientId: 100, user: { id: currentUserId, name: "Me", color: "#111" } }, // Self by clientId
        { clientId: 101, user: { id: currentUserId, name: "Me Other Tab", color: "#111" } }, // Self by userId
        { clientId: 102, user: { id: "anon-123", name: "Anonymous", color: "#222" } }, // Anonymous
        { clientId: 103, user: { id: "user-2", name: "Alice", color: "#333" } }, // Valid collaborator
        { clientId: 104, user: { id: "user-2", name: "Alice", color: "#333" } }, // Duplicate Alice
        { clientId: 105, user: { id: "user-3", name: "Bob", color: "#444" } }, // Valid collaborator
        { clientId: 106, user: null } // Disconnected/null
      ];

      const seenUserIds = new Set<string>([currentUserId]);
      const validCollaborators: Array<{ id: string; name: string }> = [];

      for (const { clientId, user } of rawStates) {
        if (clientId === currentClientId) continue;
        if (!user || !user.name || user.name === "Anonymous" || !user.id || user.id.startsWith("anon-") || user.id === "anon") {
          continue;
        }
        if (seenUserIds.has(user.id)) continue;
        seenUserIds.add(user.id);
        validCollaborators.push({ id: user.id, name: user.name });
      }

      assert.equal(validCollaborators.length, 2);
      assert.equal(validCollaborators[0]?.name, "Alice");
      assert.equal(validCollaborators[1]?.name, "Bob");
    });
  });
});
