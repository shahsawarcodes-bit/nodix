import mongoose, { Schema } from "mongoose";
import type { BlockType } from "@workspace/types";

export interface BlockDocument {
  _id: string;
  pageId: string;
  parentId: string | null;
  type: BlockType;
  pos: string;
  props: Record<string, unknown>;
  text: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blockSchema = new Schema<BlockDocument>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    pageId: {
      type: String,
      required: true
    },
    parentId: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: "text"
    },
    pos: {
      type: String,
      required: true
    },
    props: {
      type: Schema.Types.Mixed,
      default: () => ({})
    },
    text: {
      type: String,
      default: ""
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret["id"] = ret["_id"];
        return ret;
      }
    }
  }
);

blockSchema.index({ pageId: 1, parentId: 1, pos: 1 });
blockSchema.index({ deleted: 1 });

export const BlockModel =
  (mongoose.models.Block as mongoose.Model<BlockDocument> | undefined) ??
  mongoose.model<BlockDocument>("Block", blockSchema);
