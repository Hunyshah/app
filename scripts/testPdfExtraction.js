/**
 * Test script to directly test PDF extraction from a URL
 * This will help identify if the issue is with pdf-parse library or the PDF itself
 * 
 * Usage: node scripts/testPdfExtraction.js
 */

const PDF_URL = 'https://wx8jdgb1pwtwl6ku.public.blob.vercel-storage.com/business-documents/1762446141297-Wholesale%20Bulk%20Sales.pdf';

async function testPdfExtraction() {
  console.log('=== TESTING PDF EXTRACTION ===');
  console.log('PDF URL:', PDF_URL);
  console.log('\n');

  try {
    // Step 1: Test if pdf-parse can be loaded
    console.log('Step 1: Testing pdf-parse library loading...');
    let pdfParse;
    
    try {
      // Try dynamic import
      console.log('Attempting dynamic import of pdf-parse...');
      const pdfParseModule = await import('pdf-parse');
      console.log('Dynamic import result type:', typeof pdfParseModule);
      console.log('Dynamic import keys:', Object.keys(pdfParseModule));
      
      // pdf-parse v2 exports PDFParse as a class
      if (pdfParseModule.PDFParse) {
        pdfParse = pdfParseModule.PDFParse;
        console.log('✅ pdf-parse PDFParse class loaded via dynamic import');
      } else if (pdfParseModule.default && pdfParseModule.default.PDFParse) {
        pdfParse = pdfParseModule.default.PDFParse;
        console.log('✅ pdf-parse PDFParse class loaded via dynamic import (default)');
      } else {
        throw new Error('Could not find PDFParse class in module');
      }
    } catch (importError) {
      console.log('Dynamic import failed:', importError.message);
      console.log('Attempting require...');
      
      try {
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        const pdfParseModule = require('pdf-parse');
        
        if (pdfParseModule.PDFParse) {
          pdfParse = pdfParseModule.PDFParse;
          console.log('✅ pdf-parse PDFParse class loaded via require');
        } else if (pdfParseModule.default && pdfParseModule.default.PDFParse) {
          pdfParse = pdfParseModule.default.PDFParse;
          console.log('✅ pdf-parse PDFParse class loaded via require (default)');
        } else {
          throw new Error('Could not find PDFParse class');
        }
      } catch (requireError) {
        console.error('❌ Both import methods failed');
        console.error('Import error:', importError.message);
        console.error('Require error:', requireError.message);
        throw new Error('Failed to load pdf-parse library');
      }
    }

    if (!pdfParse) {
      throw new Error('pdf-parse library is null or undefined');
    }

    console.log('✅ pdf-parse library loaded successfully');
    console.log('pdf-parse type:', typeof pdfParse);
    console.log('Is class:', typeof pdfParse === 'function' && pdfParse.prototype);
    console.log('\n');

    // Step 2: Fetch the PDF
    console.log('Step 2: Fetching PDF from URL...');
    const response = await fetch(PDF_URL);
    
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('✅ PDF fetched successfully');
    console.log('PDF size:', buffer.length, 'bytes (', Math.round(buffer.length / 1024), 'KB)');
    console.log('Is Buffer:', Buffer.isBuffer(buffer));
    console.log('\n');

    // Step 3: Extract text from PDF using pdf-parse v2 API
    console.log('Step 3: Extracting text from PDF...');
    console.log('Creating PDFParse instance with data buffer...');
    
    // pdf-parse v2 uses a class-based API
    // Use 'data' parameter for buffer, or 'url' for URL
    const parser = new pdfParse({ data: buffer });
    console.log('PDFParse instance created, calling getText()...');
    
    const pdfData = await parser.getText();
    console.log('Cleaning up parser...');
    await parser.destroy();
    
    console.log('✅ PDF parsing completed');
    console.log('PDF data keys:', Object.keys(pdfData));
    console.log('Number of pages:', pdfData.numpages);
    console.log('Text length:', pdfData.text ? pdfData.text.length : 0);
    console.log('Has text:', !!pdfData.text);
    console.log('\n');

    // Step 4: Display extracted text
    if (pdfData.text && pdfData.text.trim().length > 0) {
      console.log('=== EXTRACTED TEXT ===');
      console.log('First 1000 characters:');
      console.log(pdfData.text.substring(0, 1000));
      console.log('\n');
      console.log('Full text length:', pdfData.text.length, 'characters');
      console.log('Full text preview (last 500 chars):');
      console.log(pdfData.text.substring(Math.max(0, pdfData.text.length - 500)));
    } else {
      console.log('⚠️ No text extracted from PDF');
      console.log('This might be a scanned/image-based PDF');
      console.log('PDF info:', JSON.stringify(pdfData.info || {}, null, 2));
    }

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('\nThis error indicates the issue with PDF extraction.');
  }
}

// Run the test
testPdfExtraction();

