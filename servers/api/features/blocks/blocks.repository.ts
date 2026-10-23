import type { Block, BlockType } from "@workspace/types";
import { BlockModel, type BlockDocument } from "./blocks.model.js";
import { PageModel } from "../pages/pages.model.js";

const toBlock = (doc: BlockDocument): Block => ({
  id: doc._id,
  pageId: doc.pageId,
  parentId: doc.parentId,
  type: doc.type,
  pos: doc.pos,
  props: doc.props,
  text: doc.text,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  deleted: doc.deleted
});

export interface BlocksRepository {
  findByPageId(pageId: string): Promise<readonly Block[]>;
  findById(id: string): Promise<Block | null>;
  findLastByPageId(pageId: string): Promise<Block | null>;
  countActiveByPageId(pageId: string): Promise<number>;
  create(input: {
    id?: string | undefined;
    pageId: string;
    parentId?: string | null | undefined;
    type: BlockType;
    pos: string;
    props?: Record<string, unknown> | undefined;
    text?: string | undefined;
  }): Promise<Block>;
  update(
    id: string,
    input: {
      parentId?: string | null | undefined;
      type?: BlockType | undefined;
      text?: string | undefined;
      props?: Record<string, unknown> | undefined;
      pos?: string | undefined;
    }
  ): Promise<Block | null>;
  softDelete(id: string): Promise<boolean>;
}

export const createBlocksRepository = (): BlocksRepository => ({
  findByPageId: async (pageId: string): Promise<readonly Block[]> => {
    const docs = await BlockModel.find({ pageId, deleted: false }).sort({ pos: 1 }).exec();
    return docs.map((doc) => toBlock(doc));
  },

  findById: async (id: string): Promise<Block | null> => {
    const doc = await BlockModel.findOne({ _id: id, deleted: false }).exec();
    return doc ? toBlock(doc) : null;
  },

  findLastByPageId: async (pageId: string): Promise<Block | null> => {
    const doc = await BlockModel.findOne({ pageId, deleted: false }).sort({ pos: -1 }).exec();
    return doc ? toBlock(doc) : null;
  },

  countActiveByPageId: async (pageId: string): Promise<number> => {
    return BlockModel.countDocuments({ pageId, deleted: false }).exec();
  },

  create: async (input: {
    id?: string | undefined;
    pageId: string;
    parentId?: string | null | undefined;
    type: BlockType;
    pos: string;
    props?: Record<string, unknown> | undefined;
    text?: string | undefined;
  }): Promise<Block> => {
    const docData: Record<string, unknown> = {
      pageId: input.pageId,
      parentId: input.parentId ?? null,
      type: input.type,
      pos: input.pos,
      props: input.props ?? {},
      text: input.text ?? ""
    };
    if (input.id) {
      docData["_id"] = input.id;
    }
    const doc = await BlockModel.create(docData);
    await PageModel.updateOne({ _id: input.pageId }, { $set: { updatedAt: new Date() } }).exec();
    return toBlock(doc);
  },

  update: async (id, input): Promise<Block | null> => {
    const updateData: Record<string, unknown> = {};
    if (input.parentId !== undefined) updateData["parentId"] = input.parentId;
    if (input.type !== undefined) updateData["type"] = input.type;
    if (input.text !== undefined) updateData["text"] = input.text;
    if (input.props !== undefined) updateData["props"] = input.props;
    if (input.pos !== undefined) updateData["pos"] = input.pos;

    const doc = await BlockModel.findOneAndUpdate(
      { _id: id, deleted: false },
      { $set: updateData },
      { returnDocument: "after" }
    ).exec();

    if (doc) {
      await PageModel.updateOne({ _id: doc.pageId }, { $set: { updatedAt: new Date() } }).exec();
    }
    return doc ? toBlock(doc) : null;
  },

  softDelete: async (id: string): Promise<boolean> => {
    const block = await BlockModel.findById(id).exec();
    const result = await BlockModel.updateOne(
      { _id: id, deleted: false },
      { $set: { deleted: true } }
    ).exec();

    if (result.modifiedCount > 0 && block) {
      await PageModel.updateOne({ _id: block.pageId }, { $set: { updatedAt: new Date() } }).exec();
    }
    return result.modifiedCount > 0;
  }
});
