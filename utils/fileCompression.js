import sharp from 'sharp';

/**
 * Compress file based on type
 * @param {Buffer} fileBuffer - Original file buffer
 * @param {string} fileType - MIME type of the file
 * @param {string} fileName - Name of the file
 * @returns {Promise<Buffer>} Compressed file buffer
 */
export const compressFile = async (fileBuffer, fileType, fileName) => {
  try {
    console.log(`Compressing file: ${fileName} (${fileType})`);
    console.log(`Original size: ${fileBuffer.length} bytes`);
    
    // For images, use sharp to compress
    if (fileType.startsWith('image/')) {
      const compressedBuffer = await sharp(fileBuffer)
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 80, 
          progressive: true 
        })
        .png({ 
          quality: 80, 
          progressive: true 
        })
        .webp({ 
          quality: 80 
        })
        .toBuffer();
      
      console.log(`Image compressed: ${compressedBuffer.length} bytes (${Math.round((1 - compressedBuffer.length / fileBuffer.length) * 100)}% reduction)`);
      return compressedBuffer;
    }
    
    // For PDFs, Word, Excel - return original (compression not applicable)
    if (fileType === 'application/pdf' || 
        fileType === 'application/msword' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/vnd.ms-excel' || 
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      console.log(`Document file type (${fileType}) - no compression applied`);
      return fileBuffer;
    }
    
    // For other file types, return original
    console.log(`Unknown file type (${fileType}) - no compression applied`);
    return fileBuffer;
    
  } catch (error) {
    console.error(`Error compressing file ${fileName}:`, error);
    // Return original buffer if compression fails
    console.log(`Compression failed, using original file`);
    return fileBuffer;
  }
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable file size
 */
export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file needs compression
 * @param {number} fileSize - File size in bytes
 * @param {string} fileType - MIME type of the file
 * @returns {boolean} Whether file should be compressed
 */
export const shouldCompress = (fileSize, fileType) => {
  // Compress images larger than 1MB
  if (fileType.startsWith('image/') && fileSize > 1024 * 1024) {
    return true;
  }
  
  // Compress any file larger than 5MB
  if (fileSize > 5 * 1024 * 1024) {
    return true;
  }
  
  return false;
};
