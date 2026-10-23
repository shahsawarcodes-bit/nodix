import mongoose, { Schema } from "mongoose";

export interface YjsSnapshotDocument {
  _id: string;
  pageId: string;
  update: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const yjsSnapshotSchema = new Schema<YjsSnapshotDocument>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    pageId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    update: {
      type: Buffer,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const YjsSnapshotModel =
  (mongoose.models.YjsSnapshot as mongoose.Model<YjsSnapshotDocument> | undefined) ??
  mongoose.model<YjsSnapshotDocument>("YjsSnapshot", yjsSnapshotSchema);
