import type { Request, Response } from "express";
import { ERROR_CODES, HTTP_STATUS } from "../../constants/index.js";
import { canEditPage, canViewPage, canViewPageSync } from "../auth/permissions.js";
import type { PagesService } from "./pages.service.js";
import { createPageSchema, pageIdParamSchema, updatePageSchema } from "./pages.validation.js";

export type PagesControllerDependencies = Readonly<{
  service: PagesService;
}>;

export interface PagesController {
  list(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  remove(req: Request, res: Response): Promise<void>;
}

export const createPagesController = ({ service }: PagesControllerDependencies): PagesController => ({
  list: async (req: Request, res: Response): Promise<void> => {
    const pages = await service.listPages();
    const pageMap = new Map(pages.map((p) => [p.id, p]));
    // Filter list: only return pages the user can view (with folder inheritance)
    const visiblePages = pages.filter((page) => canViewPageSync(page, req.user, pageMap));
    res.status(HTTP_STATUS.ok).json(visiblePages);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const input = createPageSchema.parse(req.body);
    const page = await service.createPage({
      ...input,
      ownerId: req.user?.id ?? null
    });
    res.status(HTTP_STATUS.ok).json(page);
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const { id } = pageIdParamSchema.parse(req.params);
    const page = await service.getPage(id);
    if (!page) {
      res.status(HTTP_STATUS.notFound).json({
        error: { code: ERROR_CODES.routeNotFound, message: "Page not found." }
      });
      return;
    }

    const viewPerm = await canViewPage(page, req.user, (pid) => service.getPage(pid));
    if (!viewPerm.allowed) {
      res.status(viewPerm.status).json({
        error: { message: viewPerm.message }
      });
      return;
    }

    res.status(HTTP_STATUS.ok).json(page);
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const { id } = pageIdParamSchema.parse(req.params);
    const existingPage = await service.getPage(id);
    if (!existingPage) {
      res.status(HTTP_STATUS.notFound).json({
        error: { code: ERROR_CODES.routeNotFound, message: "Page not found." }
      });
      return;
    }

    const editPerm = await canEditPage(existingPage, req.user, (pid) => service.getPage(pid));
    if (!editPerm.allowed) {
      res.status(editPerm.status).json({
        error: { message: editPerm.message }
      });
      return;
    }

    const input = updatePageSchema.parse(req.body);
    const page = await service.updatePage(id, input);
    res.status(HTTP_STATUS.ok).json(page);
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const { id } = pageIdParamSchema.parse(req.params);
    const existingPage = await service.getPage(id);
    if (!existingPage) {
      res.status(HTTP_STATUS.notFound).json({
        error: { code: ERROR_CODES.routeNotFound, message: "Page not found." }
      });
      return;
    }

    const editPerm = await canEditPage(existingPage, req.user, (pid) => service.getPage(pid));
    if (!editPerm.allowed) {
      res.status(editPerm.status).json({
        error: { message: editPerm.message }
      });
      return;
    }

    const deleted = await service.deletePage(id);
    if (!deleted) {
      res.status(HTTP_STATUS.notFound).json({
        error: { code: ERROR_CODES.routeNotFound, message: "Page not found." }
      });
      return;
    }
    res.status(HTTP_STATUS.ok).json({ success: true, id });
  }
});
