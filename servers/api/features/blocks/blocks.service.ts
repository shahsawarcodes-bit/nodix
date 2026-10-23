import type { Block, BlockType } from "@workspace/types";
import type { BlocksRepository } from "./blocks.repository.js";
import type { CreateBlockInput, UpdateBlockInput } from "./blocks.validation.js";

export interface BlocksService {
  listBlocks(pageId: string): Promise<readonly Block[]>;
  getBlock(id: string): Promise<Block | null>;
  createBlock(input: CreateBlockInput): Promise<Block>;
  updateBlock(id: string, input: UpdateBlockInput): Promise<Block | null>;
  deleteBlock(id: string): Promise<boolean>;
}

export type BlocksServiceDependencies = Readonly<{
  repository: BlocksRepository;
}>;

const computeNextPos = (lastBlock: Block | null, count: number): string => {
  if (!lastBlock) {
    return "a0";
  }
  const match = /^a(\d+)$/.exec(lastBlock.pos);
  if (match && match[1]) {
    const nextIndex = parseInt(match[1], 10) + 1;
    return `a${String(nextIndex)}`;
  }
  return `a${String(count)}`;
};

export const createBlocksService = ({ repository }: BlocksServiceDependencies): BlocksService => ({
  listBlocks: (pageId: string): Promise<readonly Block[]> => repository.findByPageId(pageId),

  getBlock: (id: string): Promise<Block | null> => repository.findById(id),

  createBlock: async (input: CreateBlockInput): Promise<Block> => {
    const count = await repository.countActiveByPageId(input.pageId);
    const isFirstBlock = count === 0;

    // If creating the first block for a page, make it a default 'text' block
    const blockType: BlockType = isFirstBlock
      ? "text"
      : (input.type ?? "text");

    // If creating a block without pos, auto-generate one at the end ("a0", "a1", "a2"...)
    let pos = input.pos;
    if (!pos) {
      const lastBlock = await repository.findLastByPageId(input.pageId);
      pos = computeNextPos(lastBlock, count);
    }

    return repository.create({
      id: input.id,
      pageId: input.pageId,
      parentId: input.parentId ?? null,
      type: blockType,
      pos,
      props: input.props ?? {},
      text: input.text ?? ""
    });
  },

  updateBlock: (id: string, input: UpdateBlockInput): Promise<Block | null> =>
    repository.update(id, input),

  deleteBlock: (id: string): Promise<boolean> => repository.softDelete(id)
});
