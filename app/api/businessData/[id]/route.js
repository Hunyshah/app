import { NextResponse } from "next/server";

import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import BusinessData from "@/models/businessData";
import { formatResponse } from "@/utils/response";

connectDB();

// PUT - Update business data
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const { id: businessDataId } = params;
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

    // Find business data
    const businessData = await BusinessData.findOne({
      _id: businessDataId,
      user: userId,
      status: "active",
    });

    if (!businessData) {
      return NextResponse.json(
        formatResponse(false, "Business data not found"),
        { status: 404 }
      );
    }

    // Check if business name already exists for this user (excluding current record)
    const existingBusiness = await BusinessData.findOne({
      user: userId,
      businessName: businessName.trim(),
      status: "active",
      _id: { $ne: businessDataId },
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

    // Update business data
    const updatedBusinessData = await BusinessData.findByIdAndUpdate(
      businessDataId,
      {
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
      },
      { new: true }
    ).populate("category", "name");

    return NextResponse.json(
      {
        success: true,
        message: "Business data updated successfully",
        data: updatedBusinessData,
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

// DELETE - Soft delete business data
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const { id: businessDataId } = params;

    // Find business data
    const businessData = await BusinessData.findOne({
      _id: businessDataId,
      user: userId,
      status: "active",
    });

    if (!businessData) {
      return NextResponse.json(
        formatResponse(false, "Business data not found"),
        { status: 404 }
      );
    }

    // Soft delete (update status to inactive)
    await BusinessData.findByIdAndUpdate(businessDataId, {
      status: "inactive",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business data deleted successfully",
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
