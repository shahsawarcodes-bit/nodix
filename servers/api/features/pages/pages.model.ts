import mongoose, { Schema } from "mongoose";

export interface PageDocument {
  _id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  parentId: string | null;
  ownerId?: string | null;
  generalAccess: "invited" | "public";
  publicPermission: "full_access" | "can_edit" | "can_comment" | "can_view";
  collaborators: Array<{
    email: string;
    name?: string;
    role: "full_access" | "can_edit" | "can_comment" | "can_view";
    addedAt?: Date;
  }>;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<PageDocument>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    title: {
      type: String,
      default: "Untitled",
      trim: true
    },
    icon: {
      type: String,
      default: null
    },
    coverImage: {
      type: String,
      default: null
    },
    parentId: {
      type: String,
      default: null,
      index: true
    },
    ownerId: {
      type: String,
      default: null,
      index: true
    },
    generalAccess: {
      type: String,
      enum: ["invited", "public"],
      default: "invited"
    },
    publicPermission: {
      type: String,
      enum: ["full_access", "can_edit", "can_comment", "can_view"],
      default: "can_view"
    },
    collaborators: {
      type: [
        {
          email: { type: String, required: true, trim: true, lowercase: true },
          name: { type: String, default: "" },
          role: {
            type: String,
            enum: ["full_access", "can_edit", "can_comment", "can_view"],
            default: "can_edit"
          },
          addedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
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

pageSchema.index({ deleted: 1 });
pageSchema.index({ updatedAt: -1 });

export const PageModel =
  (mongoose.models.Page as mongoose.Model<PageDocument> | undefined) ??
  mongoose.model<PageDocument>("Page", pageSchema);
