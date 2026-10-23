import test from "node:test";
import assert from "node:assert/strict";
import type { Page } from "@workspace/types";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../auth.utils.js";
import { canEditPage, canViewPage } from "../permissions.js";

void test("password hashing and verification", async () => {
  const password = "SuperSecretPassword123!";
  const hash = await hashPassword(password);
  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("WrongPassword", hash), false);
});

void test("JWT signing and verification", () => {
  const payload = { userId: "user-123", email: "alex@example.com", name: "Alex" };
  const token = signToken(payload);
  assert.ok(typeof token === "string" && token.length > 20);

  const decoded = verifyToken(token);
  assert.ok(decoded);
  assert.equal(decoded.userId, "user-123");
  assert.equal(decoded.email, "alex@example.com");

  assert.equal(verifyToken("invalid.token.here"), null);
});

void test("permission enforcement: canEditPage", async () => {
  const ownerUser = { id: "user-owner", email: "owner@test.com", name: "Owner" };
  const editorUser = { id: "user-editor", email: "editor@test.com", name: "Editor" };
  const viewerUser = { id: "user-viewer", email: "viewer@test.com", name: "Viewer" };
  const randomUser = { id: "user-other", email: "other@test.com", name: "Other" };

  const publicCanViewPage: Page = {
    id: "p-pub",
    title: "Public Page",
    icon: null,
    parentId: null,
    ownerId: "user-owner",
    generalAccess: "public",
    publicPermission: "can_view",
    collaborators: [
      { email: "editor@test.com", role: "can_edit" },
      { email: "viewer@test.com", role: "can_view" }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  // 1. Owner can always edit
  assert.equal((await canEditPage(publicCanViewPage, ownerUser)).allowed, true);

  // 2. Collaborator with can_edit can edit
  assert.equal((await canEditPage(publicCanViewPage, editorUser)).allowed, true);

  // 3. Collaborator with can_view cannot edit public view-only page -> 403
  const viewerPerm = await canEditPage(publicCanViewPage, viewerUser);
  assert.equal(viewerPerm.allowed, false);
  assert.equal(viewerPerm.status, 403);

  // 4. Random user on public can_view page -> 403 Forbidden
  const randomPerm = await canEditPage(publicCanViewPage, randomUser);
  assert.equal(randomPerm.allowed, false);
  assert.equal(randomPerm.status, 403);

  // 5. Unauthenticated user on public can_view page -> 401 Unauthorized (must login)
  const guestPerm = await canEditPage(publicCanViewPage, undefined);
  assert.equal(guestPerm.allowed, false);
  assert.equal(guestPerm.status, 401);

  // 6. Public page with can_edit permission (logged-in user can edit)
  const publicCanEditPage: Page = {
    ...publicCanViewPage,
    publicPermission: "can_edit"
  };
  assert.equal((await canEditPage(publicCanEditPage, randomUser)).allowed, true);

  // 6b. Public page with can_edit permission (unauthenticated user still gets 401)
  const guestPublicEditPerm = await canEditPage(publicCanEditPage, undefined);
  assert.equal(guestPublicEditPerm.allowed, false);
  assert.equal(guestPublicEditPerm.status, 401);

  // 7. Private page
  const privatePage: Page = {
    ...publicCanViewPage,
    generalAccess: "invited"
  };
  // Unauthenticated -> 401
  assert.equal((await canEditPage(privatePage, undefined)).status, 401);
  // Non-invited user -> 403
  assert.equal((await canEditPage(privatePage, randomUser)).status, 403);
  // Owner -> allowed
  assert.equal((await canEditPage(privatePage, ownerUser)).allowed, true);
  // Editor -> allowed
  assert.equal((await canEditPage(privatePage, editorUser)).allowed, true);

  // 8. Folder inheritance: Subpage inherits parent's can_edit
  const parentFolder: Page = {
    id: "parent-folder-1",
    title: "Shared Folder",
    icon: null,
    parentId: null,
    ownerId: "user-owner",
    generalAccess: "public",
    publicPermission: "can_edit",
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  const childPage: Page = {
    id: "child-page-1",
    title: "Child Page",
    icon: null,
    parentId: "parent-folder-1",
    ownerId: "user-owner",
    generalAccess: "invited",
    publicPermission: "can_view",
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  const mockFindPageById = async (id: string): Promise<Page | null> => {
    if (id === "parent-folder-1") return parentFolder;
    return null;
  };

  // Child page inherits can_edit from parent folder for authenticated user
  const childEditPerm = await canEditPage(childPage, randomUser, mockFindPageById);
  assert.equal(childEditPerm.allowed, true);

  // Unauthenticated user on child page still gets 401
  const childGuestPerm = await canEditPage(childPage, undefined, mockFindPageById);
  assert.equal(childGuestPerm.allowed, false);
  assert.equal(childGuestPerm.status, 401);
});

void test("permission enforcement: canViewPage", async () => {
  const ownerUser = { id: "user-owner", email: "owner@test.com", name: "Owner" };
  const invitedUser = { id: "user-inv", email: "invited@test.com", name: "Invited" };
  const otherUser = { id: "user-other", email: "other@test.com", name: "Other" };

  const publicPage: Page = {
    id: "p1",
    title: "Public Page",
    icon: null,
    parentId: null,
    ownerId: "user-owner",
    generalAccess: "public",
    publicPermission: "can_view",
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  const privatePage: Page = {
    ...publicPage,
    generalAccess: "invited",
    collaborators: [{ email: "invited@test.com", role: "can_view" }]
  };

  // Public page is viewable by anyone, even unauthenticated
  assert.equal((await canViewPage(publicPage, undefined)).allowed, true);
  assert.equal((await canViewPage(publicPage, otherUser)).allowed, true);

  // Private page view permissions
  assert.equal((await canViewPage(privatePage, undefined)).status, 401);
  assert.equal((await canViewPage(privatePage, otherUser)).status, 403);
  assert.equal((await canViewPage(privatePage, ownerUser)).allowed, true);
  assert.equal((await canViewPage(privatePage, invitedUser)).allowed, true);

  // Folder inheritance: Private child page inherits view from public parent
  const parentPublic: Page = {
    id: "parent-pub",
    title: "Public Parent",
    icon: null,
    parentId: null,
    ownerId: "user-owner",
    generalAccess: "public",
    publicPermission: "can_view",
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  const childOfPublic: Page = {
    id: "child-priv",
    title: "Child",
    icon: null,
    parentId: "parent-pub",
    ownerId: "user-owner",
    generalAccess: "invited",
    publicPermission: "can_view",
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false
  };

  const mockFindPage = async (id: string) => (id === "parent-pub" ? parentPublic : null);
  assert.equal((await canViewPage(childOfPublic, otherUser, mockFindPage)).allowed, true);
});
