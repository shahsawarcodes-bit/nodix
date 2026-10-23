import type { Page } from "@workspace/types";
import { PageModel, type PageDocument } from "./pages.model.js";

const toPage = (doc: PageDocument): Page => ({
  id: doc._id,
  title: doc.title,
  icon: doc.icon,
  coverImage: doc.coverImage ?? null,
  parentId: doc.parentId ?? null,
  ownerId: doc.ownerId ?? null,
  generalAccess: doc.generalAccess,
  publicPermission: doc.publicPermission,
  collaborators: doc.collaborators.map((c) => ({
    email: c.email,
    role: c.role,
    ...(c.name ? { name: c.name } : {}),
    ...(c.addedAt ? { addedAt: c.addedAt } : {})
  })),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  deleted: doc.deleted
});

export interface PagesRepository {
  findAllActive(): Promise<readonly Page[]>;
  findById(id: string): Promise<Page | null>;
  create(input: {
    title?: string | undefined;
    icon?: string | null | undefined;
    coverImage?: string | null | undefined;
    parentId?: string | null | undefined;
    ownerId?: string | null | undefined;
    generalAccess?: "invited" | "public" | undefined;
    publicPermission?: "full_access" | "can_edit" | "can_comment" | "can_view" | undefined;
    collaborators?: Array<{
      email: string;
      name?: string | undefined;
      role: "full_access" | "can_edit" | "can_comment" | "can_view";
      addedAt?: string | Date | undefined;
    }> | undefined;
  }): Promise<Page>;
  update(
    id: string,
    input: {
      title?: string | undefined;
      icon?: string | null | undefined;
      coverImage?: string | null | undefined;
      parentId?: string | null | undefined;
      generalAccess?: "invited" | "public" | undefined;
      publicPermission?: "full_access" | "can_edit" | "can_comment" | "can_view" | undefined;
      collaborators?: Array<{
        email: string;
        name?: string | undefined;
        role: "full_access" | "can_edit" | "can_comment" | "can_view";
        addedAt?: string | Date | undefined;
      }> | undefined;
    }
  ): Promise<Page | null>;
  softDelete(id: string): Promise<boolean>;
}

export const createPagesRepository = (): PagesRepository => ({
  findAllActive: async (): Promise<readonly Page[]> => {
    const docs = await PageModel.find({ deleted: false }).sort({ updatedAt: -1 }).exec();
    return docs.map((doc) => toPage(doc));
  },

  findById: async (id: string): Promise<Page | null> => {
    const doc = await PageModel.findOne({ _id: id, deleted: false }).exec();
    return doc ? toPage(doc) : null;
  },

  create: async (input): Promise<Page> => {
    const title = input.title?.trim();
    const doc = await PageModel.create({
      title: title && title.length > 0 ? title : "Untitled",
      icon: input.icon ?? null,
      coverImage: input.coverImage ?? null,
      parentId: input.parentId ?? null,
      ownerId: input.ownerId ?? null,
      generalAccess: input.generalAccess ?? "invited",
      publicPermission: input.publicPermission ?? "can_view",
      collaborators: (input.collaborators ?? []).map((c) => ({
        email: c.email,
        name: c.name ?? "",
        role: c.role,
        addedAt: c.addedAt ? new Date(c.addedAt) : new Date()
      }))
    });
    return toPage(doc);
  },

  update: async (id, input): Promise<Page | null> => {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData["title"] = input.title;
    if (input.icon !== undefined) updateData["icon"] = input.icon;
    if (input.coverImage !== undefined) updateData["coverImage"] = input.coverImage;
    if (input.parentId !== undefined) updateData["parentId"] = input.parentId;
    if (input.generalAccess !== undefined) updateData["generalAccess"] = input.generalAccess;
    if (input.publicPermission !== undefined) updateData["publicPermission"] = input.publicPermission;
    if (input.collaborators !== undefined) {
      updateData["collaborators"] = input.collaborators.map((c) => ({
        email: c.email,
        name: c.name ?? "",
        role: c.role,
        addedAt: c.addedAt ? new Date(c.addedAt) : new Date()
      }));
    }

    const doc = await PageModel.findOneAndUpdate(
      { _id: id, deleted: false },
      { $set: updateData },
      { returnDocument: "after" }
    ).exec();

    return doc ? toPage(doc) : null;
  },

  softDelete: async (id: string): Promise<boolean> => {
    const result = await PageModel.updateOne(
      { _id: id, deleted: false },
      { $set: { deleted: true } }
    ).exec();

    return result.modifiedCount > 0;
  }
});
