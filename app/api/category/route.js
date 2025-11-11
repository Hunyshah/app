import { NextResponse } from "next/server";
import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import Category from "@/models/category";
import { formatResponse, buildCount } from "@/utils/response";

connectDB();

// GET - Get categories with pagination and search
export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const { searchParams } = new URL(request.url);
    
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.max(parseInt(searchParams.get("limit")) || 10, 1);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      user: userId,
      status: "active",
    };

    // Add search filter if provided
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Get total count
    const totalCount = await Category.countDocuments(query);

    // Get categories with pagination
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Categories fetched successfully",
        data: categories,
        count: buildCount(totalCount, limit),
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

// POST - Create new category
export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        formatResponse(false, "Category name is required"),
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name: trimmedName,
      user: userId,
      status: "active",
    });

    if (existingCategory) {
      return NextResponse.json(
        formatResponse(false, "Category already exists"),
        { status: 409 }
      );
    }

    // Create new category
    const category = await Category.create({
      name: trimmedName,
      user: userId,
      status: "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        formatResponse(false, "Category already exists"),
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      formatResponse(false, "Internal server error", error?.message),
      { status: 500 }
    );
  }
}
