"use client"; // ✅ ensures this file is treated as client-only

import axios from "axios";
import toast from "react-hot-toast";

import { isValidFileType } from "./isValidType";
import { uploadFileApi } from "./ApiFile";
import { baseURL } from "./apiFunction";

/**
 * Upload file to Vercel Blob storage
 * ✅ Build-safe, client-only version
 * @param {File} file - File to upload
 * @param {string} token - Authentication token
 * @returns {Promise<Object|null>} Upload response with URL or null if failed
 */
export const uploadFileToVercel = async (file, token) => {
  // ✅ Prevent running on server or during build
  if (typeof window === "undefined") {
    console.warn("uploadFileToVercel called during SSR — skipped.");
    return null;
  }

  try {
    const actualFile = file?.originFileObj || file;
    if (!actualFile) {
      toast.error("No file selected");
      return null;
    }

    // ✅ Client-side only: safe to use File & FormData
    console.log("Frontend file validation:", {
      name: actualFile.name,
      type: actualFile.type,
      size: actualFile.size,
      isFile: actualFile instanceof File,
    });

    // ✅ File type validation
    if (!isValidFileType(actualFile)) {
      toast.error(
        `Invalid file type: ${actualFile.type}. Allowed: jpg, jpeg, png, svg, webp, pdf, doc, docx, xls, xlsx, txt`
      );
      return null;
    }

    // ✅ File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (actualFile.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return null;
    }

    // ✅ Prepare form data
    const formData = new FormData();
    formData.append("file", actualFile);

    // ✅ Headers (auth optional)
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // ✅ Upload request
    const response = await axios.post(`${baseURL}${uploadFileApi}`, formData, {
      headers,
    });

    const data = response?.data;

    if (data?.success) {
      // Optional compression info
      if (data.compressed && data.originalSize) {
        const ratio = Math.round(
          (1 - data.fileSize / data.originalSize) * 100
        );
        console.log(`File compressed: ${ratio}% reduction`);
      }

      return {
        fileName: data.fileName,
        fileUrl: data.url,
        fileType: data.fileType,
        fileSize: data.fileSize,
        originalSize: data.originalSize,
        compressed: data.compressed,
      };
    } else {
      throw new Error(data?.message || "Upload failed");
    }
  } catch (error) {
    console.error("Error uploading file:", error?.response?.data || error?.message);
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to upload file"
    );
    return null;
  }
};

/**
 * Upload multiple files to Vercel Blob storage
 * ✅ Parallel safe version
 * @param {File[]} files - Files array
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Successful uploads only
 */
export const uploadMultipleFilesToVercel = async (files, token) => {
  if (typeof window === "undefined") return [];

  const uploadPromises = (files || []).map((file) =>
    uploadFileToVercel(file, token)
  );

  const results = await Promise.allSettled(uploadPromises);

  // ✅ Return only successful uploads
  return results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value);
};
