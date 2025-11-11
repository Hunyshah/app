/* eslint-disable semi */
const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * Validate file by extension and MIME type
 * @param {File} file - File object to validate
 * @param {string[]} types - Allowed file extensions
 * @returns {boolean} true if valid, false otherwise
 */
const isValidFileType = (
  file,
  types = [
    "jpg",
    "jpeg",
    "png",
    "svg",
    "webp",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "txt",
  ]
) => {
  if (!file || !file.name) return false;

  const allowedExtensions = types.map((t) => t.toLowerCase());
  const fileExtension = getFileExtension(file.name).toLowerCase();

  // ✅ Extension-based check
  const isExtValid = allowedExtensions.includes(fileExtension);

  // ✅ MIME-based check (extra safety)
  const mime = file.type?.toLowerCase() || "";
  const allowedMimePatterns = [
    "image/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  const isMimeValid = allowedMimePatterns.some((pattern) =>
    mime.startsWith(pattern)
  );

  // Return true if either extension OR MIME type is valid (more flexible)
  return isExtValid || isMimeValid;
};

export { isValidFileType };
