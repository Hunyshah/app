import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { authenticateRequest } from "@/libs/auth";
import { formatResponse } from "@/utils/response";
import { compressFile, getFileSize, shouldCompress } from "@/utils/fileCompression";

// POST - Upload file to Vercel Blob
export async function POST(request) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request);
    
    if (!auth.ok) {
      return NextResponse.json(formatResponse(false, auth.message), { status: auth.status });
    }

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file");

    // Debug: Log form data
    // eslint-disable-next-line no-console
    console.log("FormData entries:", Array.from(formData.entries()));

    if (!file) {
      return NextResponse.json(
        formatResponse(false, "No file provided"),
        { status: 400 }
      );
    }

    // Debug: Log file information
    // eslint-disable-next-line no-console
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/svg+xml",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {
      // eslint-disable-next-line no-console
      console.log("File type validation failed:", {
        receivedType: file.type,
        allowedTypes: allowedTypes
      });

      return NextResponse.json(
        formatResponse(false, `Invalid file type: ${file.type}. Allowed types: images, PDF, Word, Excel documents, and text files`),
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      return NextResponse.json(
        formatResponse(false, "File too large. Maximum size is 10MB"),
        { status: 400 }
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `business-documents/${timestamp}-${file.name}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    let fileBuffer = Buffer.from(buffer);
    
    console.log(`Original file size: ${getFileSize(fileBuffer.length)}`);

    // Compress file if needed
    if (shouldCompress(fileBuffer.length, file.type)) {
      console.log(`Compressing file: ${file.name}`);
      fileBuffer = await compressFile(fileBuffer, file.type, file.name);
      console.log(`Compressed file size: ${getFileSize(fileBuffer.length)}`);
    } else {
      console.log(`File does not need compression`);
    }

    // Upload to Vercel Blob
    const { url } = await put(fileName, fileBuffer, {
      access: 'public',
      contentType: file.type
    });

    // Return success response with file information
    return NextResponse.json({
      success: true,
      url: url,
      fileName: file.name,
      fileSize: fileBuffer.length, // Use compressed size
      originalSize: file.size, // Original size for reference
      fileType: file.type,
      compressed: fileBuffer.length < file.size
    }, { status: 200 });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Upload error:", error);

    return NextResponse.json(
      formatResponse(false, "Failed to upload file", error?.message),
      { status: 500 }
    );
  }
}
