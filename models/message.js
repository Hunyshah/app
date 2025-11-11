import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    type: { type: String, enum: ["user", "ai"], required: true },
    message: { type: String, required: true },
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
    // Persist uploaded attachments per message to keep them visible across reloads
    attachments: [
      {
        uid: { type: String },
        name: { type: String },
        url: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;