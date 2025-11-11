import { NextResponse } from "next/server";

import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import BusinessData from "@/models/businessData";
import Conversation from "@/models/conversation";
import { formatResponse, buildCount } from "@/utils/response";

connectDB();

// GET - Get business data with pagination and search
export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
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

    // Get total count
    const totalCount = await BusinessData.countDocuments(query);

    // Get business data with pagination
    const businessData = await BusinessData.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Find existing conversations for each business data
    const businessDataWithConversations = await Promise.all(
      businessData.map(async (item) => {
        const conversation = await Conversation.findOne({
          user: userId,
          businessData: item._id,
        }).lean();

        return {
          ...item,
          conversationId: conversation ? String(conversation._id) : null,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "Business data fetched successfully",
        data: businessDataWithConversations,
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

// POST - Create new business data
export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const {
      businessName,
      category,
      ownerName,
      stockQuantity,
      totalCost,
      monthlyRevenue,
      profitMargin,
      location,
      contactNumber,
      email,
      description,
      uploadDocuments,
    } = await request.json();

    // Validate required fields
    const requiredFields = {
      businessName,
      category,
      ownerName,
      stockQuantity,
      totalCost,
      monthlyRevenue,
      profitMargin,
      location,
      contactNumber,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value && value !== 0) {
        return NextResponse.json(
          formatResponse(false, `${field} is required`),
          { status: 400 }
        );
      }
    }

    // Check if business name already exists for this user
    const existingBusiness = await BusinessData.findOne({
      user: userId,
      businessName: businessName.trim(),
      status: "active",
    });

    if (existingBusiness) {
      return NextResponse.json(
        formatResponse(false, "Business name already exists"),
        { status: 409 }
      );
    }

    // Transform uploadDocuments to ensure correct field names
    const transformedUploadDocuments = (uploadDocuments || []).map(doc => ({
      uid: doc.uid,
      name: doc.name,
      status: doc.status,
      url: doc.url,
      fileType: doc.fileType,
      fileSize: doc.fileSize
    }));

    // Create new business data
    const newBusinessData = await BusinessData.create({
      businessName: businessName.trim(),
      category,
      ownerName: ownerName.trim(),
      stockQuantity: parseInt(stockQuantity),
      totalCost: parseFloat(totalCost),
      monthlyRevenue: parseFloat(monthlyRevenue),
      profitMargin: parseFloat(profitMargin),
      location: location.trim(),
      contactNumber: contactNumber.trim(),
      email: email?.trim() || "",
      description: description?.trim() || "",
      uploadDocuments: transformedUploadDocuments,
      user: userId,
      status: "active",
    });

    // Populate category for response
    await newBusinessData.populate("category", "name");

    return NextResponse.json(
      {
        success: true,
        message: "Business data created successfully",
        data: newBusinessData,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      formatResponse(false, "Internal server error", error?.message),
      { status: 500 }
    );
  }
}
