/* eslint-disable padding-line-between-statements */
/* eslint-disable no-console */
import { createRequire } from "module";

import OpenAI from "openai";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

// Import pdf-parse with proper error handling
let pdfParse;
let pdfParseLoaded = false;

const loadPdfParse = async () => {
  // Only return cached if it was successfully loaded
  if (pdfParseLoaded && pdfParse) {
    console.log("✅ Using cached pdf-parse instance");
    return pdfParse;
  }
  // If it failed before, try again (reset the flag)
  if (pdfParseLoaded && !pdfParse) {
    console.log("⚠️ Previous pdf-parse load failed, retrying...");
    pdfParseLoaded = false;
  }
  
  try {
    console.log("=== ATTEMPTING TO LOAD PDF-PARSE ===");
    
    // Try createRequire first (more reliable in Next.js)
    try {
      console.log("Step 1: Trying createRequire (most reliable for Next.js)...");
      const req = createRequire(import.meta.url);
      const pdfParseModule = req("pdf-parse");
      console.log("✅ createRequire successful");
      console.log("Module type:", typeof pdfParseModule);
      console.log("Module keys:", Object.keys(pdfParseModule || {}));
    
      // Check for PDFParse class
      if (pdfParseModule && pdfParseModule.PDFParse) {
        pdfParse = pdfParseModule.PDFParse;
        console.log("✅✅✅ pdf-parse PDFParse class loaded via createRequire");
        console.log("PDFParse type:", typeof pdfParse);
        pdfParseLoaded = true;
        return pdfParse;
      } else if (pdfParseModule && pdfParseModule.default && pdfParseModule.default.PDFParse) {
        pdfParse = pdfParseModule.default.PDFParse;
        console.log("✅✅✅ pdf-parse PDFParse class loaded via createRequire (default)");
        pdfParseLoaded = true;
        return pdfParse;
      } else {
        console.error("❌ Could not find PDFParse class in pdf-parse module via createRequire");
        console.error("Module structure:", JSON.stringify(Object.keys(pdfParseModule || {})));
        pdfParse = null;
      }
    } catch (requireError) {
      console.error("❌ Failed to load pdf-parse via createRequire:", requireError.message);
      console.error("Error stack:", requireError.stack?.substring(0, 500));
      pdfParse = null;
    }
    
    // Fallback to dynamic import
    try {
      console.log("Step 2: Trying dynamic import...");
      const pdfParseModule = await import("pdf-parse");
      console.log("✅ Dynamic import successful");
      console.log("Module keys:", Object.keys(pdfParseModule || {}));
      
      // pdf-parse v2 exports PDFParse as a class
      if (pdfParseModule && pdfParseModule.PDFParse) {
        pdfParse = pdfParseModule.PDFParse;
        console.log("✅✅✅ pdf-parse PDFParse class loaded via dynamic import");
        console.log("PDFParse type:", typeof pdfParse);
        pdfParseLoaded = true;
        return pdfParse;
      } else if (pdfParseModule && pdfParseModule.default && pdfParseModule.default.PDFParse) {
        pdfParse = pdfParseModule.default.PDFParse;
        console.log("✅✅✅ pdf-parse PDFParse class loaded via dynamic import (default)");
        pdfParseLoaded = true;
        return pdfParse;
      } else {
        console.error("❌ Could not find PDFParse class in module");
        console.error("Available keys:", Object.keys(pdfParseModule || {}));
        pdfParse = null;
      }
    } catch (importError) {
      console.error("❌ Dynamic import failed:", importError.message);
      console.error("Error stack:", importError.stack?.substring(0, 500));
    }
    
    // Mark as loaded even if failed, but log the failure
    pdfParseLoaded = true;
    if (!pdfParse) {
      console.error("❌❌❌ FAILED TO LOAD PDF-PARSE - All methods failed");
      console.error("This means PDF processing will not work. Check that pdf-parse is installed: npm list pdf-parse");
    }
    return pdfParse;
  } catch (error) {
    console.error("❌❌❌ CRITICAL ERROR loading pdf-parse:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack?.substring(0, 500));
    pdfParse = null;
    pdfParseLoaded = true;
    return null;
  }
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5-search-api";
// Prefer a lighter, vision-capable default unless explicitly overridden
// const DEFAULT_VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-5-search-api";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DEFAULT_VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";

const MAX_TOKENS_TEXT = Number(process.env.OPENAI_TEXT_MAX_TOKENS || 1500);
const MAX_TOKENS_VISION = Number(process.env.OPENAI_VISION_MAX_TOKENS || 900);

/**
 * Extract text content from PDF
 * @param {Buffer} buffer - PDF file buffer
 * @param {string} fileName - Name of the file
 * @param {string} url - Optional URL of the PDF (more efficient than buffer)
 * @returns {Promise<string>} Extracted text content
 */
const extractPDFContent = async (buffer, fileName, url = null) => {
  try {
    console.log(`=== PDF PROCESSING START ===`);
    console.log(`Processing PDF: ${fileName}`);
    console.log(`Buffer size: ${buffer.length} bytes`);
    console.log(`Buffer type: ${typeof buffer}`);
    console.log(`Buffer constructor: ${buffer.constructor.name}`);
    
    // Load pdf-parse if not already loaded
    pdfParse = await loadPdfParse();
    
    // Check if pdf-parse is available
    if (!pdfParse) {
      console.error(`pdf-parse library not available`);
      return `PDF Document Analysis: ${fileName}

Document Information:
- File Name: ${fileName}
- File Size: ${buffer.length} bytes
- File Type: PDF Document
- Status: PDF processing library not available

The PDF has been successfully uploaded, but the PDF processing library is not available. This is a technical issue that needs to be resolved.

To analyze this PDF, you can:
1. Copy and paste the text content from the PDF
2. Convert the PDF to a Word document and re-upload
3. Share key sections manually for analysis

The document is ready for manual content sharing if needed.`;
    }
    
    // Ensure buffer is properly formatted
    if (!Buffer.isBuffer(buffer)) {
      console.log(`Converting to Buffer from: ${typeof buffer}`);
      buffer = Buffer.from(buffer);
    }
    
    console.log(`Buffer after conversion: ${Buffer.isBuffer(buffer)}`);
    
    // Extract text content from PDF using pdf-parse v2 API
    console.log(`Calling pdf-parse...`);
    let pdfData;
    let extractedText;
    
    try {
      if (!pdfParse) {
        throw new Error("pdf-parse library not available");
      }
      
      // pdf-parse v2 uses a class-based API
      // Try URL first (more efficient), fallback to buffer if URL fails
      let parser;
      let useUrl = false;
      let pdfData;
      
      if (url) {
        try {
          console.log(`Attempting to create PDFParse instance with URL (more efficient)...`);
          parser = new pdfParse({ url });
          useUrl = true;
          console.log(`PDFParse instance created with URL, calling getText()...`);
          
          try {
            pdfData = await parser.getText();
            console.log(`PDF parse with URL completed successfully`);
            await parser.destroy();
          } catch (getTextError) {
            console.log(`getText() failed with URL, will try buffer instead:`, getTextError.message);
            await parser.destroy().catch(() => {}); // Clean up
            useUrl = false; // Fall back to buffer
          }
        } catch (urlError) {
          console.log(`Failed to create parser with URL, will use buffer instead:`, urlError.message);
          useUrl = false;
        }
      }
      
      // If URL approach failed or wasn't used, try buffer
      if (!useUrl || !pdfData) {
        console.log(`Creating PDFParse instance with data buffer...`);
        parser = new pdfParse({ data: buffer });
        console.log(`PDFParse instance created with buffer, calling getText()...`);
        
        pdfData = await parser.getText();
        console.log(`PDF parse with buffer completed`);
        await parser.destroy();
      }
      
      console.log(`PDF parse completed`);
      console.log(`PDF data keys:`, Object.keys(pdfData));
      console.log(`PDF text length: ${pdfData.text ? pdfData.text.length : 'undefined'}`);
      console.log(`PDF numpages: ${pdfData.numpages || pdfData.total || 'undefined'}`);
      
      extractedText = pdfData.text;
    } catch (parseError) {
      console.error(`PDF parse failed:`, parseError);
      console.error(`Error details:`, parseError.message);
      
      // Try alternative approach - use a different PDF processing method
      console.log(`Attempting alternative PDF processing...`);
      
      // Try to extract basic text using a simple approach
      try {
        console.log(`Attempting basic text extraction...`);
        const textContent = buffer.toString('utf8');
        const cleanText = textContent.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (cleanText.length > 100) {
          console.log(`Basic text extraction successful: ${cleanText.length} characters`);
          return cleanText;
        }
      } catch (basicError) {
        console.log(`Basic text extraction failed:`, basicError.message);
      }
      
      // For now, return a message indicating the PDF was received but needs manual processing
      return `PDF Document Analysis: ${fileName}

Document Information:
- File Name: ${fileName}
- File Size: ${buffer.length} bytes
- File Type: PDF Document
- Status: Received but requires manual processing

The PDF has been successfully uploaded, but automatic text extraction encountered an issue. This could be due to:
- PDF format compatibility issues
- Complex PDF structure
- Security restrictions
- Library compatibility issues

To analyze this PDF, you can:
1. Copy and paste the text content from the PDF
2. Convert the PDF to a Word document and re-upload
3. Share key sections manually for analysis

The document is ready for manual content sharing if needed.`;
    }
    
    console.log(`PDF text extraction completed. Text length: ${extractedText ? extractedText.length : 'undefined'} characters`);
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.log(`No text content found in PDF: ${fileName}`);
      console.log(`Raw pdfData:`, JSON.stringify(pdfData, null, 2));
      
      return `PDF Document Analysis: ${fileName}

Document Information:
- File Name: ${fileName}
- File Size: ${buffer.length} bytes
- File Type: PDF Document
- Status: Successfully processed but no text content found

This PDF appears to be image-based or scanned. The document has been uploaded successfully, but no extractable text was found. This could be:
- A scanned document (image-based PDF)
- A PDF with only images/graphics
- A password-protected or encrypted PDF

For analysis of this document, you could:
1. Use OCR tools to extract text from images
2. Convert the PDF to images and use our image analysis feature
3. Share the key information manually for analysis`;
    }
    
    console.log(`=== PDF PROCESSING SUCCESS ===`);
    console.log(`Extracted text preview: ${extractedText.substring(0, 200)}...`);
    console.log(`Full text length: ${extractedText.length} characters`);
    
    // Return the full extracted text for OpenAI analysis
    return extractedText;
  } catch (error) {
    console.error(`=== PDF PROCESSING ERROR ===`);
    console.error(`Error processing PDF content from ${fileName}:`, error);
    console.error(`Error stack:`, error.stack);
    console.error(`Error name:`, error.name);
    console.error(`Error message:`, error.message);
    
    // Provide helpful fallback response
    return `PDF Document Analysis: ${fileName}

Document Information:
- File Name: ${fileName}
- File Size: ${buffer.length} bytes
- File Type: PDF Document
- Status: Processing error encountered

Error Details: ${error.message}

The PDF could not be processed automatically. This might be due to:
- Corrupted or invalid PDF file
- Password-protected PDF
- Unsupported PDF version
- File format issues

Please try:
1. Ensuring the PDF is not password-protected
2. Converting to a different format (Word, text)
3. Sharing the content manually for analysis`;
  }
};

/**
 * Extract text content from Word document
 * @param {Buffer} buffer - Word file buffer
 * @param {string} fileName - Name of the file
 * @returns {Promise<string>} Extracted text content
 */
const extractWordContent = async (buffer, fileName) => {
  try {
    console.log(`Extracting text from Word document: ${fileName}`);
    console.log(`Buffer size: ${buffer.length} bytes`);
    
    // Try mammoth extraction with different options
    const result = await mammoth.extractRawText({ 
      buffer,
      // Add options to handle problematic documents
      ignoreEmptyParagraphs: true,
      includeEmbeddedStyleMap: false,
      includeDefaultStyleMap: false
    });
    
    console.log(`Word document text extraction completed. Text length: ${result.value.length}`);
    console.log(`Extracted text preview: ${result.value.substring(0, 200)}...`);
    
    return result.value;
  } catch (error) {
    console.error(`Error extracting Word content from ${fileName}:`, error);
    console.error(`Error details:`, error.message);
    
    // Try alternative extraction methods
    try {
      console.log(`Attempting alternative Word document processing...`);
      
      // Try with different mammoth options
      const result2 = await mammoth.extractRawText({ 
        buffer,
        ignoreEmptyParagraphs: true
      });
      
      if (result2.value && result2.value.trim().length > 0) {
        console.log(`Alternative extraction successful: ${result2.value.length} characters`);
        return result2.value;
      }
    } catch (altError) {
      console.log(`Alternative extraction failed:`, altError.message);
    }
    
    // Try basic text extraction as last resort
    try {
      console.log(`Attempting basic text extraction from Word document...`);
      
      // Try to extract readable text from the Word document buffer
      const textContent = buffer.toString('utf8');
      
      // Look for actual text content in the document
      // Word documents contain text in specific XML structures
      const textMatches = textContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      
      if (textMatches && textMatches.length > 0) {
        let extractedText = '';
        textMatches.forEach(match => {
          const textContent = match.replace(/<[^>]*>/g, '').trim();
          if (textContent && textContent.length > 0) {
            extractedText += textContent + ' ';
          }
        });
        
        const cleanText = extractedText.replace(/\s+/g, ' ').trim();
        
        if (cleanText.length > 100) {
          console.log(`Basic text extraction successful: ${cleanText.length} characters`);
          console.log(`Extracted text preview: ${cleanText.substring(0, 200)}...`);
          return cleanText;
        }
      }
      
      // Fallback: try to find any readable text patterns
      const readableText = textContent
        .replace(/<[^>]*>/g, ' ') // Remove XML tags
        .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII and whitespace
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (readableText.length > 100) {
        console.log(`Fallback text extraction successful: ${readableText.length} characters`);
        console.log(`Extracted text preview: ${readableText.substring(0, 200)}...`);
        return readableText;
      }
    } catch (basicError) {
      console.log(`Basic text extraction failed:`, basicError.message);
    }
    
    // If all methods fail, return a helpful error message
    return `Word Document Analysis: ${fileName}

Document Information:
- File Name: ${fileName}
- File Size: ${buffer.length} bytes
- File Type: Word Document (.docx)
- Status: Processing error encountered

Error Details: ${error.message}

The Word document could not be processed automatically. This might be due to:
- Document corruption or format issues
- Complex formatting or embedded objects
- Password protection or security restrictions
- Unsupported Word document version

To analyze this document, you can:
1. Save the document as a plain text file (.txt) and re-upload
2. Copy and paste the content manually for analysis
3. Try converting to PDF format and re-upload
4. Share key sections manually for analysis

The document is ready for manual content sharing if needed.`;
  }
};

/**
 * Extract data from Excel file
 * @param {Buffer} buffer - Excel file buffer
 * @param {string} fileName - Name of the file
 * @returns {Promise<string>} Extracted data content
 */
const extractExcelContent = async (buffer, fileName) => {
  try {
    console.log(`Extracting data from Excel file: ${fileName}`);
    console.log(`Buffer size: ${buffer.length} bytes`);
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    let extractedData = '';
    const sheetNames = workbook.SheetNames;
    
    console.log(`Excel workbook loaded. Sheets: ${sheetNames.length}`);
    
    sheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      extractedData += `\n--- Sheet ${index + 1}: ${sheetName} ---\n`;
      
      if (jsonData.length > 0) {
        // Convert to readable format
        jsonData.forEach((row, rowIndex) => {
          if (row && row.length > 0) {
            extractedData += `Row ${rowIndex + 1}: ${row.join(' | ')}\n`;
          }
        });
      } else {
        extractedData += 'No data found in this sheet.\n';
      }
    });
    
    console.log(`Excel data extraction completed. Sheets: ${sheetNames.length}`);
    console.log(`Extracted data length: ${extractedData.length} characters`);
    return extractedData;
  } catch (error) {
    console.error(`Error extracting Excel content from ${fileName}:`, error);
    console.error(`Error details:`, error.message);
    
    // Try alternative extraction methods
    try {
      console.log(`Attempting alternative Excel processing...`);
      
      // Try with different XLSX options
      const workbook2 = XLSX.read(buffer, { 
        type: 'buffer',
        cellDates: false,
        cellNF: false,
        cellText: false
      });
      
      let extractedData2 = '';
      const sheetNames2 = workbook2.SheetNames;
      
      sheetNames2.forEach((sheetName, index) => {
        const worksheet = workbook2.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
        
        extractedData2 += `\n--- Sheet ${index + 1}: ${sheetName} ---\n`;
        
        if (jsonData.length > 0) {
          jsonData.forEach((row, rowIndex) => {
            if (row && row.length > 0) {
              extractedData2 += `Row ${rowIndex + 1}: ${row.join(' | ')}\n`;
            }
          });
        } else {
          extractedData2 += 'No data found in this sheet.\n';
        }
      });
      
      if (extractedData2.trim().length > 0) {
        console.log(`Alternative Excel extraction successful: ${extractedData2.length} characters`);
        return extractedData2;
      }
    } catch (altError) {
      console.log(`Alternative Excel extraction failed:`, altError.message);
    }
    
    // If all methods fail, return a helpful error message
    return `Excel Document Analysis: ${fileName}

Document Information:
- File Name: ${fileName}
- File Size: ${buffer.length} bytes
- File Type: Excel Document (.xlsx/.xls)
- Status: Processing error encountered

Error Details: ${error.message}

The Excel document could not be processed automatically. This might be due to:
- Document corruption or format issues
- Complex formulas or macros
- Password protection or security restrictions
- Unsupported Excel document version

To analyze this document, you can:
1. Save the document as a CSV file and re-upload
2. Copy and paste the data manually for analysis
3. Try converting to PDF format and re-upload
4. Share key sections manually for analysis

The document is ready for manual content sharing if needed.`;
  }
};

/**
 * Extract content from plain text file
 * @param {Buffer} buffer - Text file buffer
 * @param {string} fileName - Name of the file
 * @returns {Promise<string>} Extracted text content
 */
const extractTextContent = async (buffer, fileName) => {
  try {
    console.log(`Extracting content from text file: ${fileName}`);
    
    // Convert buffer to string with proper encoding detection
    let textContent;
    try {
      // Try UTF-8 first
      textContent = buffer.toString('utf8');
    } catch (error) {
      // Fallback to latin1 if UTF-8 fails
      textContent = buffer.toString('latin1');
    }
    
    console.log(`Text file extraction completed. Text length: ${textContent.length} characters`);
    return textContent;
  } catch (error) {
    console.error(`Error extracting text content from ${fileName}:`, error);
    throw new Error(`Failed to extract text content: ${error.message}`);
  }
};

/**
 * Analyze image using OpenAI vision
 * @param {Buffer} buffer - Image file buffer
 * @param {string} fileName - Name of the file
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<string>} Analyzed content
 */
// Prefer remote URL to avoid embedding huge base64 content which increases tokens
const analyzeImageContentByUrl = async (imageUrl, fileName, fileType) => {
  try {
    console.log(`Analyzing image via URL using vision: ${fileName}`);
    const completion = await openai.chat.completions.create({
      model: DEFAULT_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze the following image document: "${fileName}" (${fileType}). Extract key text/data, business metrics, and important insights. Be concise and accurate.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: MAX_TOKENS_VISION,
      temperature: 0.2
    });

    const analysisResult = completion.choices?.[0]?.message?.content || "";
    console.log(`Vision analysis completed for ${fileName}`);
    return analysisResult;
  } catch (error) {
    console.error(`Error analyzing image ${fileName}:`, error);
    // Gracefully handle rate limit errors so the chat continues
    if (String(error?.message || "").includes("429") || String(error?.message || "").toLowerCase().includes("rate limit")) {
      return `Image Analysis: ${fileName}

The image was uploaded successfully, but temporary rate limits prevented automated analysis. Please retry in a minute or send a brief description of the image to proceed.`;
    }
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

/**
 * Analyze a document from a URL
 * @param {string} url - The URL of the document to analyze
 * @param {string} fileName - The name of the file
 * @param {string} fileType - The MIME type of the file
 * @returns {Promise<string>} The analyzed content of the document
 */
export const analyzeDocument = async (url, fileName, fileType) => {
  try {
    console.log(`=== STARTING DOCUMENT ANALYSIS ===`);
    console.log(`Document: ${fileName} (${fileType})`);
    console.log(`Original URL: ${url}`);
    console.log(`URL type: ${typeof url}`);
    console.log(`URL length: ${url?.length || 0}`);
    
    // Sanitize URL to avoid fetch failures due to whitespace/backticks/quotes
    const safeUrl = (() => {
      try {
        const raw = String(url);
        const sanitized = raw.trim().replace(/^`+|`+$/g, '').replace(/^"+|"+$/g, "");
        console.log(`Sanitized URL: ${sanitized}`);
        return sanitized;
      } catch (error) {
        console.error(`Error sanitizing URL:`, error);
        return url;
      }
    })();
    if (safeUrl !== url) {
      console.log(`URL was sanitized. Before: "${url}", After: "${safeUrl}"`);
    }
    
    // Validate URL
    if (!safeUrl || safeUrl.trim().length === 0) {
      throw new Error(`Invalid URL: URL is empty or undefined`);
    }
    
    // Fetch the document content
    console.log(`Step 1: Fetching document from URL...`);
    console.log(`Fetching from: ${safeUrl}`);
    const response = await fetch(safeUrl);
    console.log(`Fetch response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error(`Fetch failed. Status: ${response.status}, StatusText: ${response.statusText}`);
      throw new Error(`Failed to fetch document: ${response.statusText} (Status: ${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    
    console.log(`Step 2: Document fetched successfully. Size: ${buffer.byteLength} bytes (${Math.round(buffer.byteLength / 1024)} KB)`);
    console.log(`File type detected: ${fileType}`);
    
    // Check if file is too large for processing
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (buffer.byteLength > maxSize) {
      console.log(`File too large for processing: ${Math.round(buffer.byteLength / 1024 / 1024)} MB`);
      return `Document Analysis: ${fileName}

File Information:
- File Name: ${fileName}
- File Size: ${Math.round(buffer.byteLength / 1024)} KB
- File Type: ${fileType}
- Status: File too large for processing

The document is too large for automatic analysis. Please try:
1. Compressing the file before upload
2. Splitting large documents into smaller sections
3. Converting to a different format (e.g., PDF to Word)
4. Sharing key sections manually for analysis`;
    }

    let extractedContent = '';
    let analysisResult = '';

    // Determine file type and extract content accordingly
    if (fileType.startsWith('image/')) {
      // For images, use OpenAI vision against the remote URL to minimize tokens
      console.log(`Processing image file: ${fileName}`);
      analysisResult = await analyzeImageContentByUrl(safeUrl, fileName, fileType);
    } else if (fileType === 'application/pdf') {
      // For PDFs, extract text and analyze with OpenAI
      console.log(`=== PROCESSING PDF FILE ===`);
      console.log(`File name: ${fileName}`);
      console.log(`File URL: ${safeUrl}`);
      console.log(`File buffer size: ${fileBuffer.length} bytes`);
      console.log(`File buffer type: ${fileBuffer.constructor.name}`);
      console.log(`Is Buffer: ${Buffer.isBuffer(fileBuffer)}`);
      
      // Try using URL directly first (more efficient), fallback to buffer
      extractedContent = await extractPDFContent(fileBuffer, fileName, safeUrl);
      
      console.log(`=== PDF EXTRACTION RESULT ===`);
      console.log(`Extracted content exists: ${!!extractedContent}`);
      console.log(`Extracted content length: ${extractedContent ? extractedContent.length : 'undefined'}`);
      console.log(`Extracted content type: ${typeof extractedContent}`);
      console.log(`Extracted content preview (first 200 chars): ${extractedContent ? extractedContent.substring(0, 200) : 'undefined'}`);
      console.log(`Contains error message: ${extractedContent ? extractedContent.includes('PDF Document Analysis:') : false}`);
      
      // Check if the extracted content is actual text or an error message
      if (extractedContent && extractedContent.trim() && !extractedContent.includes('PDF Document Analysis:')) {
        console.log(`=== PDF CONTENT EXTRACTION SUCCESS ===`);
        console.log(`Extracted content length: ${extractedContent.length} characters`);
        console.log(`Content preview (first 500 chars): ${extractedContent.substring(0, 500)}...`);
        console.log(`Starting OpenAI analysis...`);
        analysisResult = await analyzeTextContent(extractedContent, fileName, fileType);
        console.log(`=== PDF ANALYSIS COMPLETED SUCCESSFULLY ===`);
        console.log(`Analysis result length: ${analysisResult?.length || 0} characters`);
      } else {
        console.log(`=== PDF CONTENT EXTRACTION FAILED OR RETURNED ERROR MESSAGE ===`);
        console.log(`Reason: ${!extractedContent ? 'No content extracted' : !extractedContent.trim() ? 'Content is empty/whitespace' : 'Contains error message'}`);
        analysisResult = extractedContent || `PDF Analysis: ${fileName}\n\nNo text content could be extracted from this PDF. This might be a scanned document or image-based PDF.`;
        console.log(`Using fallback analysis result`);
      }
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For Word documents, extract text and analyze with OpenAI
      console.log(`Processing Word document: ${fileName}`);
      extractedContent = await extractWordContent(fileBuffer, fileName);
      
      console.log(`Word extracted content length: ${extractedContent ? extractedContent.length : 'undefined'}`);
      console.log(`Word extracted content preview: ${extractedContent ? extractedContent.substring(0, 100) : 'undefined'}`);
      
      // Check if the extracted content is actual text or an error message
      if (extractedContent && extractedContent.trim() && !extractedContent.includes('Word Document Analysis:')) {
        console.log(`Word content extracted successfully, analyzing with OpenAI...`);
        analysisResult = await analyzeTextContent(extractedContent, fileName, fileType);
        console.log(`Word analysis completed successfully`);
      } else {
        console.log(`Word content extraction failed or returned error message`);
        analysisResult = extractedContent || `Word Document Analysis: ${fileName}\n\nNo text content could be extracted from this Word document.`;
      }
    } else if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // For Excel files, extract data and analyze with OpenAI
      console.log(`Processing Excel file: ${fileName}`);
      extractedContent = await extractExcelContent(fileBuffer, fileName);
      
      if (extractedContent.trim()) {
        analysisResult = await analyzeTextContent(extractedContent, fileName, fileType);
      } else {
        analysisResult = `Excel Analysis: ${fileName}\n\nNo data could be extracted from this Excel file.`;
      }
    } else if (fileType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
      // For plain text files, extract content and analyze with OpenAI
      console.log(`Processing text file: ${fileName}`);
      extractedContent = await extractTextContent(fileBuffer, fileName);
      
      if (extractedContent.trim()) {
        analysisResult = await analyzeTextContent(extractedContent, fileName, fileType);
      } else {
        analysisResult = `Text File Analysis: ${fileName}\n\nNo content could be extracted from this text file.`;
      }
    } else {
      // Unsupported file type
      analysisResult = `Document Analysis: ${fileName}\n\nFile Type: ${fileType}\n\nThis file type is not currently supported for content analysis. Only images, PDFs, Word documents, Excel files, and text files can be analyzed.`;
    }

    return analysisResult;
    
  } catch (error) {
    console.error(`Error analyzing document ${fileName}:`, error);
    
    // If the main analysis fails, provide a fallback response
    return `Document Analysis: ${fileName}
    
File Type: ${fileType}
File Name: ${fileName}

The document "${fileName}" has been uploaded but encountered an error during analysis: ${error.message}

This could be due to:
1. File format compatibility issues
2. File size limitations
3. Network connectivity issues

Please try uploading the document again or contact support if the issue persists.`;
  }
};

/**
 * Analyze extracted text content using OpenAI
 * @param {string} content - Extracted text content
 * @param {string} fileName - Name of the file
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<string>} Analyzed content
 */
const analyzeTextContent = async (content, fileName, fileType) => {
  try {
    console.log(`Analyzing extracted text content from ${fileName}`);
    console.log(`Content length: ${content.length} characters`);
    console.log(`Content preview: ${content.substring(0, 200)}...`);
    
    // Estimate tokens (roughly 4 characters per token, but be conservative)
    // Use a smaller limit to avoid TPM (tokens per minute) rate limits
    // Limit to ~4000 tokens to leave room for prompt and response
    const estimatedTokens = Math.ceil(content.length / 3); // Conservative estimate: 3 chars per token
    console.log(`Estimated tokens: ${estimatedTokens}`);
    
    // Check if content is too large for OpenAI (limit to ~4000 tokens to avoid TPM limits)
    const maxTokens = 4000;
    const maxContentLength = maxTokens * 3; // ~12,000 characters for safety
    
    if (estimatedTokens > maxTokens || content.length > maxContentLength) {
      console.log(`Content too large (${content.length} chars, ~${estimatedTokens} tokens), summarizing first...`);
      
      // For large content, first create a summary to reduce token usage
      // Then use that summary for the main analysis
      try {
        console.log(`Step 1: Creating summary of large document...`);
        const summaryPrompt = `You are analyzing a large document titled "${fileName}" (${fileType}). 

The document contains ${content.length} characters of text. Please create a comprehensive but concise summary that captures:

1. **Main Purpose & Type**: What is this document about?
2. **Key Data Points**: Important numbers, dates, names, and metrics
3. **Business Information**: Revenue, costs, products, customers, sales data
4. **Important Sections**: What are the main sections/topics covered?
5. **Critical Details**: Any deadlines, requirements, or actionable items

DOCUMENT CONTENT:
${content.substring(0, maxContentLength)}${content.length > maxContentLength ? '\n\n[Content truncated - showing first portion]' : ''}

Please provide a detailed but concise summary (aim for 1000-2000 words) that captures all the essential information.`;

        const summaryCompletion = await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "user",
              content: summaryPrompt
            }
          ],
          max_tokens: MAX_TOKENS_TEXT,
          temperature: 0.3
        });

        const summary = summaryCompletion.choices[0].message.content;
        console.log(`Summary created (${summary.length} chars). Now creating final analysis...`);
        
        // Use the summary for the final analysis
        content = summary;
        console.log(`Using summarized content for analysis (${content.length} chars)`);
      } catch (summaryError) {
        console.error(`Error creating summary, will try chunking instead:`, summaryError.message);
        
        // Fallback to chunking if summary fails
        const chunks = [];
        const chunkSize = maxContentLength;
        
        for (let i = 0; i < content.length; i += chunkSize) {
          chunks.push(content.substring(i, i + chunkSize));
        }
        
        console.log(`Split content into ${chunks.length} chunks`);
        
        // Analyze only first 2 chunks to avoid rate limits
        const chunkAnalyses = [];
        
        for (let i = 0; i < Math.min(chunks.length, 2); i++) {
          console.log(`Analyzing chunk ${i + 1}/${Math.min(chunks.length, 2)}...`);
          
          const chunkPrompt = `Analyze this section ${i + 1} of ${Math.min(chunks.length, 2)} from "${fileName}".

CONTENT:
${chunks[i]}

Extract: key data, business metrics, important facts, and actionable insights. Be concise.`;

          try {
            const chunkCompletion = await openai.chat.completions.create({
              model: DEFAULT_MODEL,
              messages: [{ role: "user", content: chunkPrompt }],
              max_tokens: 1500,
              temperature: 0.3
            });

            chunkAnalyses.push(`Section ${i + 1}:\n${chunkCompletion.choices[0].message.content}\n`);
          } catch (chunkError) {
            console.error(`Error analyzing chunk ${i + 1}:`, chunkError.message);
            chunkAnalyses.push(`Section ${i + 1}: Error - ${chunkError.message}\n`);
          }
        }
        
        return `Document Analysis: ${fileName}\n\n${chunkAnalyses.join('\n')}\n[Note: Document was large and analyzed in sections]`;
      }
    }
    
    // For smaller content, proceed with normal analysis
    const isPDF = fileType === 'application/pdf';
    const isWord = fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    let prompt = isPDF 
      ? `You are analyzing a PDF document titled "${fileName}". The complete text content has been extracted and provided below.

COMPLETE PDF CONTENT:
${content}

Please provide a comprehensive analysis of this PDF document including:

1. **Document Overview:**
   - Document type and purpose
   - Main topics and sections covered
   - Overall structure and organization

2. **Key Information Extraction:**
   - All important facts, figures, and data points
   - Names, dates, locations, and contact information
   - Financial information, budgets, costs, or revenue data
   - Technical specifications or requirements
   - Goals, objectives, and outcomes

3. **Business Analysis:**
   - Business metrics and KPIs mentioned
   - Market analysis or industry insights
   - Competitive information
   - Growth opportunities or challenges
   - Strategic recommendations

4. **Technical Details:**
   - Any calculations, formulas, or mathematical data
   - Technical specifications or requirements
   - Process descriptions or workflows
   - Tools, technologies, or methodologies mentioned

5. **Action Items and Next Steps:**
   - Any tasks, deadlines, or deliverables mentioned
   - Recommendations or conclusions
   - Follow-up actions required

6. **Summary and Insights:**
   - Key takeaways and main points
   - Important relationships between different sections
   - Critical information that requires attention

Be thorough, accurate, and provide specific details from the document. Quote relevant sections when appropriate.`
      : isWord
      ? `You are analyzing a Word document titled "${fileName}". The complete text content has been extracted and provided below.

COMPLETE WORD DOCUMENT CONTENT:
${content}

Please provide a comprehensive analysis of this Word document including:

1. **Document Overview:**
   - Document type and purpose
   - Main topics and sections covered
   - Overall structure and organization

2. **Key Information Extraction:**
   - All important facts, figures, and data points
   - Names, dates, locations, and contact information
   - Financial information, budgets, costs, or revenue data
   - Technical specifications or requirements
   - Goals, objectives, and outcomes

3. **Business Analysis:**
   - Business metrics and KPIs mentioned
   - Market analysis or industry insights
   - Competitive information
   - Growth opportunities or challenges
   - Strategic recommendations

4. **Technical Details:**
   - Any calculations, formulas, or mathematical data
   - Technical specifications or requirements
   - Process descriptions or workflows
   - Tools, technologies, or methodologies mentioned

5. **Action Items and Next Steps:**
   - Any tasks, deadlines, or deliverables mentioned
   - Recommendations or conclusions
   - Follow-up actions required

6. **Summary and Insights:**
   - Key takeaways and main points
   - Important relationships between different sections
   - Critical information that requires attention

Be thorough, accurate, and provide specific details from the document. Quote relevant sections when appropriate.`
      : `Please analyze this document content extracted from "${fileName}" (${fileType}).

DOCUMENT CONTENT:
${content}

Please provide a comprehensive analysis including:
- All text content and data
- Business information, metrics, and financial data
- Key insights and important details
- Any calculations, formulas, or numerical data
- Structured data and relationships
- Any other relevant information that would be useful for business analysis

Be thorough and accurate in your analysis. If this is a spreadsheet or document with data, provide specific details about the content.`;

    // Final check on token estimate before sending
    const finalTokenEstimate = Math.ceil(prompt.length / 3);
    console.log(`Final prompt token estimate: ~${finalTokenEstimate} tokens`);
    
    // If still too large, truncate the content in the prompt
    if (finalTokenEstimate > maxTokens) {
      console.log(`Prompt still too large, truncating content...`);
      const maxContentInPrompt = (maxTokens * 3) - 500; // Leave room for prompt text
      if (prompt.includes('COMPLETE PDF CONTENT:') || prompt.includes('DOCUMENT CONTENT:')) {
        // Find and truncate the content portion
        const contentMatch = prompt.match(/(COMPLETE PDF CONTENT:|DOCUMENT CONTENT:)\s*([\s\S]*?)(?=\n\nPlease|$)/);
        if (contentMatch && contentMatch[2]) {
          const originalContent = contentMatch[2];
          const truncatedContent = originalContent.substring(0, maxContentInPrompt) + '\n\n[Content truncated due to size limits]';
          prompt = prompt.replace(originalContent, truncatedContent);
          console.log(`Content truncated from ${originalContent.length} to ${truncatedContent.length} chars`);
        }
      }
    }
    
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: Math.min(MAX_TOKENS_TEXT, 2000), // Reduce max_tokens to avoid TPM limits
      temperature: 0.3
    });

    const analysisResult = completion.choices[0].message.content;
    console.log(`Text content analysis completed for ${fileName}`);
    console.log(`Analysis length: ${analysisResult.length} characters`);
    return analysisResult;
  } catch (error) {
    console.error(`Error analyzing text content from ${fileName}:`, error);
    
    // Handle rate limit errors specifically
    if (error.message.includes('429') || error.message.includes('rate_limit')) {
      return `Document Analysis: ${fileName}

The document "${fileName}" has been uploaded successfully, but the analysis encountered a rate limit error. This is likely due to the document being too large or complex for immediate processing.

Document Information:
- File Name: ${fileName}
- File Type: ${fileType}
- Content Length: ${content.length} characters
- Status: Rate limit exceeded

To analyze this document, you can:
1. Try uploading the document again in a few minutes
2. Break the document into smaller sections
3. Copy and paste key sections manually for analysis
4. Convert to a different format (PDF, text) and re-upload

The document is ready for manual content sharing if needed.`;
    }
    
    throw new Error(`Failed to analyze text content: ${error.message}`);
  }
};

/**
 * Analyze multiple documents
 * @param {Array} uploadDocuments - Array of document objects with url, fileName, fileType
 * @returns {Promise<Array>} Array of analyzed content for each document
 */
export const analyzeMultipleDocuments = async (uploadDocuments) => {
  console.log(`=== ANALYZE MULTIPLE DOCUMENTS START ===`);
  console.log(`Input documents:`, JSON.stringify(uploadDocuments, null, 2));
  
  if (!uploadDocuments || uploadDocuments.length === 0) {
    console.log(`No documents to analyze. Returning empty array.`);
    return [];
  }

  try {
    console.log(`Starting analysis of ${uploadDocuments.length} documents...`);
    // Process sequentially to avoid rate bursts and TPM spikes
    const results = [];
    for (let i = 0; i < uploadDocuments.length; i++) {
      const doc = uploadDocuments[i];
      console.log(`\n=== DOCUMENT ${i + 1}/${uploadDocuments.length} ===`);
      console.log(`Document name: ${doc.name}`);
      console.log(`Document URL: ${doc.url}`);
      console.log(`Document fileType: ${doc.fileType}`);
      console.log(`Document fileSize: ${doc.fileSize}`);
      
      try {
        console.log(`Starting analysis for: ${doc.name}`);
        const analysis = await analyzeDocument(doc.url, doc.name, doc.fileType);
        console.log(`Successfully analyzed: ${doc.name}`);
        console.log(`Analysis length: ${analysis?.length || 0} characters`);
        results.push({
          fileName: doc.name,
          fileType: doc.fileType,
          analysis,
          success: true
        });
      } catch (error) {
        console.error(`=== ERROR ANALYZING DOCUMENT ${doc.name} ===`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
        results.push({
          fileName: doc.name,
          fileType: doc.fileType,
          analysis: `Error analyzing document ${doc.name}: ${error.message}`,
          success: false
        });
      }
    }
    
    const successfulResults = results.filter(result => result.success);
    const failedResults = results.filter(result => !result.success);
    
    console.log(`\n=== DOCUMENT ANALYSIS SUMMARY ===`);
    console.log(`Total documents: ${uploadDocuments.length}`);
    console.log(`Successful: ${successfulResults.length}`);
    console.log(`Failed: ${failedResults.length}`);
    console.log(`Results:`, JSON.stringify(results.map(r => ({
      fileName: r.fileName,
      success: r.success,
      analysisLength: r.analysis?.length || 0
    })), null, 2));
    
    // Return all results, including failed ones, so the AI knows what documents were attempted
    return results;
  } catch (error) {
    console.error("=== ERROR IN ANALYZE MULTIPLE DOCUMENTS ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return [];
  }
};
