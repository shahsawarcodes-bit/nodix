import type { Page } from "@workspace/types";
import type { PagesRepository } from "./pages.repository.js";
import type { CreatePageInput, UpdatePageInput } from "./pages.validation.js";

export interface PagesService {
  listPages(): Promise<readonly Page[]>;
  getPage(id: string): Promise<Page | null>;
  createPage(input: CreatePageInput & { ownerId?: string | null | undefined }): Promise<Page>;
  updatePage(id: string, input: UpdatePageInput): Promise<Page | null>;
  deletePage(id: string): Promise<boolean>;
}

export type PagesServiceDependencies = Readonly<{
  repository: PagesRepository;
}>;

export const createPagesService = ({ repository }: PagesServiceDependencies): PagesService => ({
  listPages: (): Promise<readonly Page[]> => repository.findAllActive(),
  getPage: (id: string): Promise<Page | null> => repository.findById(id),
  createPage: (input: CreatePageInput & { ownerId?: string | null | undefined }): Promise<Page> =>
    repository.create(input),
  updatePage: (id: string, input: UpdatePageInput): Promise<Page | null> => repository.update(id, input),
  deletePage: (id: string): Promise<boolean> => repository.softDelete(id)
});
