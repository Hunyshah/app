import { NextResponse } from "next/server";
import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import Category from "@/models/category";
import { formatResponse } from "@/utils/response";

connectDB();

// PUT - Update category
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const { id: categoryId } = params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        formatResponse(false, "Category name is required"),
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if category exists and belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      user: userId,
      status: "active",
    });

    if (!category) {
      return NextResponse.json(
        formatResponse(false, "Category not found"),
        { status: 404 }
      );
    }

    // Check if new name already exists for this user (excluding current category)
    const existingCategory = await Category.findOne({
      name: trimmedName,
      user: userId,
      status: "active",
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      return NextResponse.json(
        formatResponse(false, "Category already exists"),
        { status: 409 }
      );
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name: trimmedName },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      },
      { status: 200 }
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

// DELETE - Soft delete category
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    const { id: userId } = auth.user;
    const { id: categoryId } = params;

    // Check if category exists and belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      user: userId,
      status: "active",
    });

    if (!category) {
      return NextResponse.json(
        formatResponse(false, "Category not found"),
        { status: 404 }
      );
    }

    // Soft delete - update status to inactive
    await Category.findByIdAndUpdate(categoryId, { status: "inactive" });

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
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
