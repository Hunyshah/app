/*
  Simple test script to fetch a remote PDF and parse it using pdf-parse.
  Logs detailed console output to help diagnose parsing issues.
*/

const pdfParse = require('pdf-parse');

const TEST_URL = process.env.TEST_PDF_URL || 'https://wx8jdgb1pwtwl6ku.public.blob.vercel-storage.com/business-documents/1761986760075-huraira-resume-bb.pdf';

async function run() {
  try {
    console.log('=== PDF-Parse Test Start ===');
    console.log('Fetching URL:', TEST_URL);

    // Node 18+ supports global fetch
    const res = await fetch(TEST_URL);
    console.log('Fetch status:', res.status, res.statusText);
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Fetched bytes:', buffer.length);

    try {
      console.log('Calling pdf-parse...');
      const data = await pdfParse(buffer);
      console.log('pdf-parse keys:', Object.keys(data));
      console.log('Pages:', data.numpages);
      console.log('Info:', data.info);
      console.log('Text length:', data.text ? data.text.length : 0);
      console.log('Text preview:', (data.text || '').substring(0, 400));
      console.log('=== PDF-Parse Test Success ===');
    } catch (err) {
      console.error('=== PDF-Parse Error ===');
      console.error('Message:', err && err.message);
      console.error('Name:', err && err.name);
      console.error('Stack:', err && err.stack);
      console.error('Full error object:', err);
    }
  } catch (outer) {
    console.error('=== Test Script Error ===');
    console.error(outer);
  }
}

run();