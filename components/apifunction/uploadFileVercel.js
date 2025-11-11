import axios from "axios";
import toast from "react-hot-toast";

import { isValidFileType } from "./isValidType";
import { uploadFileApi } from "./ApiFile";
import { baseURL } from "./apiFunction";

/**
 * Upload file to Vercel Blob storage
 * @param {File} file - File to upload
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Upload response with URL
 */
export const uploadFileToVercel = async (file, token) => {
  try {
    // Handle Ant Design Upload file object - get the actual File object
    const actualFile = file.originFileObj || file;
    
    // Debug: Log file information
    // eslint-disable-next-line no-console
    console.log("Frontend file validation:", {
      name: actualFile.name,
      type: actualFile.type,
      size: actualFile.size,
      isFile: actualFile instanceof File,
      fileObject: actualFile
    });

    // Validate file type
    const check = isValidFileType(actualFile);

    if (!check) {
      // eslint-disable-next-line no-console
      console.log("Frontend validation failed for file:", actualFile.name, "type:", actualFile.type);

      toast.error(
        `Invalid file type: ${actualFile.type}. Allowed: jpg, jpeg, png, svg, webp, pdf, doc, docx, xls, xlsx, txt`
      );

      return null;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (actualFile.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB");

      return null;
    }

    // Create form data
    const formData = new FormData();

    formData.append("file", actualFile);

    // Create headers with authentication
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Upload to Vercel Blob using authenticated request
    const response = await axios.post(
      `${baseURL}${uploadFileApi}`,
      formData,
      { headers }
    );

    if (response?.data?.success) {
      // Show compression info if file was compressed
      if (response.data.compressed && response.data.originalSize) {
        const compressionRatio = Math.round((1 - response.data.fileSize / response.data.originalSize) * 100);
        console.log(`File compressed: ${compressionRatio}% size reduction`);
      }
      
      return {
        fileName: response.data.fileName,
        fileUrl: response.data.url,
        fileType: response.data.fileType,
        fileSize: response.data.fileSize,
        originalSize: response.data.originalSize,
        compressed: response.data.compressed,
      };
    } else {
      throw new Error(response?.data?.message || "Upload failed");
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error uploading file:", error?.response?.data || error?.message);

    toast.error(error?.response?.data?.message || error?.message || "Failed to upload file");

    return null;
  }
};

/**
 * Upload multiple files to Vercel Blob storage
 * @param {File[]} files - Array of files to upload
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} Array of upload responses
 */
export const uploadMultipleFilesToVercel = async (files, token) => {
  const uploadPromises = files.map(file => uploadFileToVercel(file, token));
  const results = await Promise.all(uploadPromises);
  
  // Filter out null results (failed uploads)
  return results.filter(result => result !== null);
};
