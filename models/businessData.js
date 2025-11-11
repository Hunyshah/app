import mongoose from "mongoose";

const businessDataSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    monthlyRevenue: {
      type: Number,
      required: true,
      min: 0,
    },
    profitMargin: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    uploadDocuments: [
      {
        uid: {
          type: String,
          required: false,
        },
        name: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
      },
    ],
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

businessDataSchema.index({ user: 1, businessName: 1 }, { unique: true });

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.BusinessData) {
  delete mongoose.models.BusinessData;
}

const BusinessData = mongoose.model("BusinessData", businessDataSchema);

export default BusinessData;
