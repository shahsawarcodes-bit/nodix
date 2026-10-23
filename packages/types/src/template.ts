import type { BlockType } from "./block.js";

export interface TemplateBlock {
  id?: string;
  type: BlockType;
  text?: string;
  props?: Record<string, unknown>;
  pos: string;
  parentId?: string | null;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  coverImage?: string | null;
  blocks: TemplateBlock[];
  createdAt: string | Date;
  updatedAt: string | Date;
}
