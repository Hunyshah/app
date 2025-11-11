import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    title: { type: String },
    businessData: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessData" },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, createdAt: -1 });

const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

export default Conversation;