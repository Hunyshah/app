// lib/analyzeDocument.ts  ← Server-only file

import { PDFParse } from 'pdf-parse';

export const analyzeDocument = async (doc) => {
  try {
    if (!doc || (!doc.url && !doc.buffer)) {
      return "No file provided";
    }

    let parser;

    if (doc.url) {
      parser = new PDFParse({ url: doc.url });
    } else if (doc.buffer) {
      const buffer = Buffer.isBuffer(doc.buffer)
        ? doc.buffer
        : Buffer.from(doc.buffer );
      parser = new PDFParse({ data: buffer });
    } else {
      return "Invalid document source";
    }

    const result = await parser.getText();
    await parser.destroy?.(); // Safe destroy

    if (!result?.text?.trim()) {
      return "No text extracted from PDF (might be scanned/image-based)";
    }

    const cleanText = result.text
      .replace(/-- \d+ of \d+ --/g, '')   // Remove page footers
      .replace(/\n{3,}/g, '\n\n')        // Collapse multiple newlines
      .trim();

    return cleanText; // ← RETURN STRING, NOT OBJECT!
  } catch (error) {
    console.error("PDF parsing failed:", error);
    return `Error extracting text: ${error.message || error}`;
  }
};

export const analyzeMultipleDocuments = async (
  documents
) => {
  const results = [];

  for (const doc of documents) {
    const analysis = await analyzeDocument(doc); // ← This is now ALWAYS a string

    results.push({
      fileName: doc.name || "Unknown.pdf",
      fileType: doc.fileType || "application/pdf",
      analysis,                    // ← String (success or error)
      success: !analysis.startsWith("Error") && !analysis.includes("No text extracted"),
    });
  }

  return results;
};