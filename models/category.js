import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique category names per user
categorySchema.index({ name: 1, user: 1 }, { unique: true });

// Index for efficient queries
categorySchema.index({ user: 1, status: 1 });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
