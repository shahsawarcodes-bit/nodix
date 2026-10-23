import { z } from "zod";

export const createPageSchema = z.object({
  title: z.string().trim().optional(),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  parentId: z.string().trim().nullable().optional()
});

export const collaboratorRoleSchema = z.enum(["full_access", "can_edit", "can_comment", "can_view"]);
export const generalAccessSchema = z.enum(["invited", "public"]);

export const collaboratorSchema = z.object({
  email: z.email(),
  name: z.string().trim().optional(),
  role: collaboratorRoleSchema,
  addedAt: z.union([z.string(), z.date()]).optional()
});

export const updatePageSchema = z.object({
  title: z.string().trim().optional(),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  parentId: z.string().trim().nullable().optional(),
  generalAccess: generalAccessSchema.optional(),
  publicPermission: collaboratorRoleSchema.optional(),
  collaborators: z.array(collaboratorSchema).optional()
});

export const pageIdParamSchema = z.object({
  id: z.string().trim().min(1)
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type PageIdParam = z.infer<typeof pageIdParamSchema>;
