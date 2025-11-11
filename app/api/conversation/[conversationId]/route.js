import { NextResponse } from "next/server";

import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import { formatResponse, buildCount } from "@/utils/response";

export async function GET(request, context) {
  try {
    // Connect to database for each request in serverless environment
    await connectDB();
    
    const auth = await authenticateRequest(request);

    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { 
        status: auth.status,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    const { id: userId } = auth.user;
    const { conversationId } = await context.params;
    const pageRaw = new URL(request.url).searchParams.get("page");
    const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

    if (!conversation) {
      return NextResponse.json(formatResponse(false, "Invalid conversationId"), { 
        status: 404,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    const totalCount = await Message.countDocuments({ conversation: conversation._id });

    // Fetch latest-first page, then reverse to chronological within the page
    const messagesDesc = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const messages = [...messagesDesc].reverse();

    const result = messages.map((m) => ({
      type: m.type,
      user: m.user?.id ? { id: String(m.user.id), name: m.user?.name } : undefined,
      message: m.message,
      attachments: Array.isArray(m.attachments) ? m.attachments : [],
      createdAt: m.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Fetched messages successfully",
        data: result,
        count: buildCount(totalCount, limit),
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error?.message || "Unknown error" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}