/*
  ESM test harness that uses the same document analysis code as the app.
  It fetches the provided URL, dispatches to PDF parsing via analyzeDocument,
  and logs detailed output so we can see extraction vs. OpenAI analysis.
*/

import { analyzeDocument } from "../libs/documentAnalyzer.js";

const DEFAULT_URL = "https://wx8jdgb1pwtwl6ku.public.blob.vercel-storage.com/business-documents/1761986760075-huraira-resume-bb.pdf";
const DEFAULT_NAME = "huraira-resume-bb.pdf";
const DEFAULT_TYPE = "application/pdf";

const url = process.env.TEST_PDF_URL || DEFAULT_URL;
const name = process.env.TEST_PDF_NAME || DEFAULT_NAME;
const type = process.env.TEST_PDF_TYPE || DEFAULT_TYPE;

async function run() {
  try {
    console.log("=== Analyzer Test Start ===");
    console.log("URL:", url);
    console.log("File:", name, "Type:", type);

    const result = await analyzeDocument(url, name, type);
    console.log("=== Analyzer Result ===");
    if (typeof result === "string") {
      console.log("Result length:", result.length);
      console.log("Preview:\n", result.substring(0, 600));
    } else {
      console.dir(result, { depth: 3 });
    }
    console.log("=== Analyzer Test End ===");
  } catch (err) {
    console.error("=== Analyzer Test Error ===");
    console.error("Message:", err?.message);
    console.error("Stack:", err?.stack);
    console.error("Full error:", err);
  }
}

run();