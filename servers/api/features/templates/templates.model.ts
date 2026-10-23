import mongoose, { Schema } from "mongoose";
import type { BlockType, Template, TemplateBlock } from "@workspace/types";

export interface TemplateDocument {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  coverImage?: string | null;
  blocks: TemplateBlock[];
  createdAt: Date;
  updatedAt: Date;
}

export const toTemplate = (doc: {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  coverImage?: string | null | undefined;
  blocks?: Array<{
    id?: string | undefined;
    type?: string | undefined;
    text?: string | undefined;
    props?: Record<string, unknown> | undefined;
    pos?: string | undefined;
    parentId?: string | null | undefined;
  }> | undefined;
  createdAt: Date;
  updatedAt: Date;
}): Template => ({
  id: doc._id,
  name: doc.name,
  description: doc.description,
  icon: doc.icon,
  category: doc.category,
  coverImage: doc.coverImage ?? null,
  blocks: (doc.blocks ?? []).map((b) => ({
    ...(b.id ? { id: b.id } : {}),
    type: (b.type ?? "text") as BlockType,
    text: b.text ?? "",
    props: b.props ?? {},
    pos: b.pos ?? "a0",
    parentId: b.parentId ?? null
  })),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

const templateSchema = new Schema<TemplateDocument>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    icon: {
      type: String,
      default: "📄"
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    coverImage: {
      type: String,
      default: null
    },
    blocks: {
      type: [
        {
          id: { type: String, default: null },
          type: { type: String, default: "text" },
          text: { type: String, default: "" },
          props: { type: Schema.Types.Mixed, default: () => ({}) },
          pos: { type: String, required: true },
          parentId: { type: String, default: null }
        }
      ],
      default: []
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

templateSchema.index({ category: 1 });
templateSchema.index({ createdAt: 1 });

export const TemplateModel =
  (mongoose.models.Template as mongoose.Model<TemplateDocument> | undefined) ??
  mongoose.model<TemplateDocument>("Template", templateSchema);
