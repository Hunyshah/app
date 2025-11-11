import { NextResponse } from "next/server";

import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import { formatResponse, buildCount } from "@/utils/response";

connectDB();

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }
    const { id: userId } = auth.user;
    const pageRaw = new URL(request.url).searchParams.get("page");
    const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalCount = await Conversation.countDocuments({ user: userId });

    const conversations = await Conversation.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const previews = await Promise.all(
      conversations.map(async (conv) => {
        let firstMsg = null;

        if (conv.firstMessageId) {
          firstMsg = await Message.findById(conv.firstMessageId).lean();
        }
        if (!firstMsg) {
          firstMsg = await Message.find({ conversation: conv._id })
            .sort({ createdAt: 1 })
            .limit(1)
            .lean();
          firstMsg = Array.isArray(firstMsg) ? firstMsg[0] : firstMsg;
        }

        return {
          conversationId: String(conv._id),
          firstMessage: firstMsg
            ? {
                type: firstMsg.type,
                user: firstMsg.user?.id
                  ? { id: String(firstMsg.user.id), name: firstMsg.user?.name }
                  : undefined,
                message: firstMsg.message,
                createdAt: firstMsg.createdAt,
              }
            : null,
          createdAt: conv.createdAt,
          businessDataId: conv.businessData ? String(conv.businessData) : null,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "Fetched conversations successfully",
        data: previews,
        count: buildCount(totalCount, limit),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}