import { z } from "zod";

const blockTypes = [
  "text",
  "h1",
  "h2",
  "h3",
  "todo",
  "toggle",
  "bulleted_list",
  "numbered_list",
  "quote",
  "code",
  "divider",
  "link_to_page",
  "image",
  "file",
  "database"
] as const;

export const createBlockSchema = z.object({
  id: z.string().trim().optional(),
  pageId: z.string().trim().min(1),
  parentId: z.string().trim().nullable().optional(),
  type: z.enum(blockTypes).optional(),
  text: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  pos: z.string().trim().optional()
});

export const updateBlockSchema = z.object({
  parentId: z.string().trim().nullable().optional(),
  type: z.enum(blockTypes).optional(),
  text: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  pos: z.string().trim().optional()
});

export const blockIdParamSchema = z.object({
  id: z.string().trim().min(1)
});

export const listBlocksQuerySchema = z.object({
  pageId: z.string().trim().min(1)
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
export type BlockIdParam = z.infer<typeof blockIdParamSchema>;
export type ListBlocksQuery = z.infer<typeof listBlocksQuerySchema>;
