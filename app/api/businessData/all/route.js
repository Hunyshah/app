import { NextResponse } from "next/server";
import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import BusinessData from "@/models/businessData";
import { formatResponse } from "@/utils/response";

connectDB();

// GET - Get all business data without pagination
export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Build query
    const query = {
      user: userId,
      status: "active",
    };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Get all business data
    const businessData = await BusinessData.find(query)
      .populate("category", "name")
      .sort({ businessName: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Business data fetched successfully",
        data: businessData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      formatResponse(false, "Internal server error", error?.message),
      { status: 500 }
    );
  }
}
