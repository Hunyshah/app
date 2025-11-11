import { NextResponse } from "next/server";
import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import Category from "@/models/category";
import { formatResponse } from "@/utils/response";

connectDB();

// GET - Get all categories without pagination
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
      query.name = { $regex: search, $options: "i" };
    }

    // Get all categories
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Categories fetched successfully",
        data: categories,
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
