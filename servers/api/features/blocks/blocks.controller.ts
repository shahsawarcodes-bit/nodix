import type { Request, Response } from "express";
import { ERROR_CODES, HTTP_STATUS } from "../../constants/index.js";
import { canEditPage, canViewPage } from "../auth/permissions.js";
import { createPagesRepository } from "../pages/pages.repository.js";
import type { BlocksService } from "./blocks.service.js";
import {
  blockIdParamSchema,
  createBlockSchema,
  listBlocksQuerySchema,
  updateBlockSchema
} from "./blocks.validation.js";

export type BlocksControllerDependencies = Readonly<{
  service: BlocksService;
}>;

export interface BlocksController {
  list(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  remove(req: Request, res: Response): Promise<void>;
}

export const createBlocksController = ({ service }: BlocksControllerDependencies): BlocksController => {
  const pagesRepository = createPagesRepository();

  return {
    list: async (req: Request, res: Response): Promise<void> => {
      const { pageId } = listBlocksQuerySchema.parse(req.query);
      const page = await pagesRepository.findById(pageId);
      if (page) {
        const viewPerm = await canViewPage(page, req.user, (pid) => pagesRepository.findById(pid));
        if (!viewPerm.allowed) {
          res.status(viewPerm.status).json({
            error: { message: viewPerm.message }
          });
          return;
        }
      }
      const blocks = await service.listBlocks(pageId);
      res.status(HTTP_STATUS.ok).json(blocks);
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const input = createBlockSchema.parse(req.body);
      const page = await pagesRepository.findById(input.pageId);
      if (!page) {
        res.status(HTTP_STATUS.notFound).json({
          error: { code: ERROR_CODES.routeNotFound, message: "Page not found." }
        });
        return;
      }

      const editPerm = await canEditPage(page, req.user, (pid) => pagesRepository.findById(pid));
      if (!editPerm.allowed) {
        res.status(editPerm.status).json({
          error: { message: editPerm.message }
        });
        return;
      }

      const block = await service.createBlock(input);
      res.status(HTTP_STATUS.ok).json(block);
    },

    getById: async (req: Request, res: Response): Promise<void> => {
      const { id } = blockIdParamSchema.parse(req.params);
      const block = await service.getBlock(id);
      if (!block) {
        res.status(HTTP_STATUS.notFound).json({
          error: { code: ERROR_CODES.routeNotFound, message: "Block not found." }
        });
        return;
      }

      const page = await pagesRepository.findById(block.pageId);
      if (page) {
        const viewPerm = await canViewPage(page, req.user, (pid) => pagesRepository.findById(pid));
        if (!viewPerm.allowed) {
          res.status(viewPerm.status).json({
            error: { message: viewPerm.message }
          });
          return;
        }
      }

      res.status(HTTP_STATUS.ok).json(block);
    },

    update: async (req: Request, res: Response): Promise<void> => {
      const { id } = blockIdParamSchema.parse(req.params);
      const block = await service.getBlock(id);
      if (!block) {
        res.status(HTTP_STATUS.notFound).json({
          error: { code: ERROR_CODES.routeNotFound, message: "Block not found." }
        });
        return;
      }

      const page = await pagesRepository.findById(block.pageId);
      if (page) {
        const editPerm = await canEditPage(page, req.user, (pid) => pagesRepository.findById(pid));
        if (!editPerm.allowed) {
          res.status(editPerm.status).json({
            error: { message: editPerm.message }
          });
          return;
        }
      }

      const input = updateBlockSchema.parse(req.body);
      const updatedBlock = await service.updateBlock(id, input);
      res.status(HTTP_STATUS.ok).json(updatedBlock);
    },

    remove: async (req: Request, res: Response): Promise<void> => {
      const { id } = blockIdParamSchema.parse(req.params);
      const block = await service.getBlock(id);
      if (!block) {
        res.status(HTTP_STATUS.notFound).json({
          error: { code: ERROR_CODES.routeNotFound, message: "Block not found." }
        });
        return;
      }

      const page = await pagesRepository.findById(block.pageId);
      if (page) {
        const editPerm = await canEditPage(page, req.user, (pid) => pagesRepository.findById(pid));
        if (!editPerm.allowed) {
          res.status(editPerm.status).json({
            error: { message: editPerm.message }
          });
          return;
        }
      }

      const deleted = await service.deleteBlock(id);
      if (!deleted) {
        res.status(HTTP_STATUS.notFound).json({
          error: { code: ERROR_CODES.routeNotFound, message: "Block not found." }
        });
        return;
      }
      res.status(HTTP_STATUS.ok).json({ success: true, id });
    }
  };
};
