import type { Request, Response } from "express";
import mongoose from "mongoose";
import type { Page, Template, TemplateBlock } from "@workspace/types";
import { HTTP_STATUS } from "../../constants/index.js";
import { BlockModel } from "../blocks/blocks.model.js";
import { PageModel, type PageDocument } from "../pages/pages.model.js";
import { TemplateModel, toTemplate } from "./templates.model.js";
import { DEFAULT_TEMPLATES, ensureDefaultTemplates } from "./templates.seed.js";

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

export const createTemplatesController = () => ({
  list: async (_req: Request, res: Response): Promise<void> => {
    await ensureDefaultTemplates();
    const docs = await TemplateModel.find().sort({ createdAt: 1 }).exec();
    const templates: Template[] = docs.map((doc) => toTemplate(doc));
    res.status(HTTP_STATUS.ok).json(templates);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = body["name"];
    const description = body["description"];
    const icon = body["icon"];
    const category = body["category"];
    const blocks = body["blocks"];

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(HTTP_STATUS.badRequest).json({
        error: { message: "Template name is required." }
      });
      return;
    }

    const doc = await TemplateModel.create({
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      icon: typeof icon === "string" ? icon : "📄",
      category: typeof category === "string" ? category.trim() : "General",
      blocks: (Array.isArray(blocks) ? blocks : []) as TemplateBlock[]
    });

    res.status(HTTP_STATUS.created).json(toTemplate(doc));
  },

  apply: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const parentId = body["parentId"];

    const template = await TemplateModel.findById(id).exec();
    if (!template) {
      res.status(HTTP_STATUS.notFound).json({
        error: { message: "Template not found." }
      });
      return;
    }

    // Create the page with template title and icon
    const newPageDoc = await PageModel.create({
      title: template.name,
      icon: template.icon,
      coverImage: template.coverImage ?? null,
      parentId: typeof parentId === "string" && parentId ? parentId : null,
      ownerId: req.user?.id ?? null,
      generalAccess: "invited",
      publicPermission: "can_view",
      collaborators: []
    });

    // Copy all blocks from the template to the new page, preserving nested parentId relationships
    if (Array.isArray(template.blocks) && template.blocks.length > 0) {
      const idMap = new Map<string, string>();
      for (const block of template.blocks) {
        if (block.id) {
          idMap.set(block.id, new mongoose.Types.ObjectId().toString());
        }
      }

      const blocksToInsert = template.blocks.map((block) => {
        const newId = (block.id && idMap.get(block.id)) || new mongoose.Types.ObjectId().toString();
        const resolvedParentId = block.parentId ? (idMap.get(block.parentId) ?? block.parentId) : null;

        return {
          _id: newId,
          pageId: newPageDoc._id,
          parentId: resolvedParentId,
          type: block.type,
          text: block.text ?? "",
          props: block.props ?? {},
          pos: block.pos
        };
      });
      await BlockModel.insertMany(blocksToInsert);
    }

    res.status(HTTP_STATUS.ok).json(toPage(newPageDoc));
  },

  seed: async (_req: Request, res: Response): Promise<void> => {
    await TemplateModel.deleteMany({});
    const docs = await TemplateModel.insertMany(DEFAULT_TEMPLATES);
    const templates: Template[] = docs.map((doc) => toTemplate(doc));
    res.status(HTTP_STATUS.ok).json({ success: true, count: templates.length, templates });
  }
});
