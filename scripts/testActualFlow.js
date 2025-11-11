/**
 * Test the actual flow with the real payload
 * This simulates what happens when a message is sent with businessDataId
 */

import { analyzeDocument } from '../libs/documentAnalyzer.js';

const PDF_URL = 'https://wx8jdgb1pwtwl6ku.public.blob.vercel-storage.com/business-documents/1762446141297-Wholesale%20Bulk%20Sales.pdf';
const FILE_NAME = 'Wholesale Bulk Sales.pdf';
const FILE_TYPE = 'application/pdf';

async function testActualFlow() {
  console.log('=== TESTING ACTUAL DOCUMENT ANALYSIS FLOW ===');
  console.log('PDF URL:', PDF_URL);
  console.log('File Name:', FILE_NAME);
  console.log('File Type:', FILE_TYPE);
  console.log('\n');

  try {
    console.log('Calling analyzeDocument...');
    const result = await analyzeDocument(PDF_URL, FILE_NAME, FILE_TYPE);
    
    console.log('\n=== ANALYSIS RESULT ===');
    console.log('Result type:', typeof result);
    console.log('Result length:', result?.length || 0);
    console.log('Result preview (first 500 chars):');
    console.log(result?.substring(0, 500) || 'No result');
    console.log('\n');
    
    // Check if it's an error message
    if (result && result.includes('PDF Document Analysis:')) {
      console.log('⚠️ Result appears to be an error message');
      console.log('This means PDF extraction failed');
    } else if (result && result.length > 0) {
      console.log('✅ Result appears to be successful analysis');
      console.log('Full result length:', result.length);
    } else {
      console.log('❌ No result returned');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR IN ANALYSIS');
    console.error('Error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testActualFlow();

