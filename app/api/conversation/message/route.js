import { NextResponse } from "next/server";
import OpenAI from "openai";

import { connectDB } from "@/libs/mongoDB";
import { authenticateRequest } from "@/libs/auth";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import BusinessData from "@/models/businessData";
import Category from "@/models/category";
import { siteConfig } from "@/config/site";
import { formatResponse } from "@/utils/response";
import { analyzeMultipleDocuments } from "@/libs/docAnalizer";



connectDB();
export const runtime = "nodejs";
export const maxDuration = 300; // allow long OpenAI responses (5 mins)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const MODEL = process.env.OPENAI_MODEL || "gpt-5-search-api";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const buildSystemPrompt = (businessData = null, documentAnalysis = null) => {
  console.log("=== BUILD SYSTEM PROMPT ===");
  console.log("Business data exists:", !!businessData);
  console.log("Document analysis exists:", !!documentAnalysis);
  console.log("Document analysis length:", documentAnalysis?.length || 0);
  if (documentAnalysis && documentAnalysis.length > 0) {
    console.log("Document analysis details:", documentAnalysis.map(d => ({
      fileName: d.fileName,
      fileType: d.fileType,
      hasAnalysis: !!d.analysis,
      analysisLength: d.analysis?.length || 0
    })));
  }
  
  const name = "AI Sales Forecasting outine";
  const description = siteConfig?.description || "Contextual assistant for the website.";

  // Handle document analysis for both business data and general uploads
  let documentContext = "";
  if (documentAnalysis && documentAnalysis.length > 0) {
    console.log("Building document context from", documentAnalysis.length, "documents");
    documentContext = `

UPLOADED DOCUMENTS ANALYSIS:
The following documents have been uploaded and analyzed:

${documentAnalysis.map(doc => `
Document: ${doc.fileName} (${doc.fileType})
Analysis: ${doc.analysis}
`).join('\n')}

IMPORTANT: You have access to the full content of these uploaded documents. When users ask questions about:
- "What's written in my document" - provide the actual content from the documents
- Calculations or data analysis - use the specific data from the documents
- Financial information - reference the exact numbers and details from the documents
- Any other document-related questions - base your answers on the actual document content

Use the information from these documents to provide comprehensive, accurate, and specific insights.`;
    console.log("Document context built. Length:", documentContext.length);
  } else {
    console.log("No document analysis provided, skipping document context");
  }

  if (businessData) {
    console.log("Building system prompt with business data:", businessData.businessName);
    const prompt = `You are a helpful AI assistant for ${name}. You are currently focused on analyzing a specific business.

BUSINESS CONTEXT:
- Business Name: ${businessData.businessName}
- Category: ${businessData.category?.name || businessData.category}
- Owner: ${businessData.ownerName}
- Stock Quantity: ${businessData.stockQuantity}
- Total Cost: $${businessData.totalCost}
- Monthly Revenue: $${businessData.monthlyRevenue}
- Profit Margin: ${businessData.profitMargin}%
- Location: ${businessData.location}
- Contact: ${businessData.contactNumber}
- Email: ${businessData.email || 'Not provided'}
- Description: ${businessData.description || 'Not provided'}${documentContext}

IMPORTANT: You should ONLY respond to questions related to this specific business (${businessData.businessName}). If the user asks about anything unrelated to this business, politely redirect them to ask about this business's performance, recommendations, or analysis. Do not provide general business advice unless it's specifically about this business.`;
    console.log("System prompt with business data built. Length:", prompt.length);
    console.log("Includes document context:", prompt.includes("UPLOADED DOCUMENTS ANALYSIS"));
    return prompt;
  }

  // Handle general document analysis without specific business context
  if (documentAnalysis && documentAnalysis.length > 0) {
    console.log("Building system prompt with document analysis only (no business data)");
    const prompt = `You are a helpful AI assistant for ${name}. You have been provided with uploaded documents for analysis.

${documentContext}

Please analyze the uploaded documents and provide comprehensive insights based on their content. Be thorough and accurate in your analysis.`;
    console.log("System prompt with documents only built. Length:", prompt.length);
    return prompt;
  }

  console.log("Building default system prompt (no business data, no documents)");
  return `You are a helpful AI assistant for ${name}. Use the following website context to answer concisely, friendly, and accurately. Context: ${description}`;
};

// Sanitize a URL string by trimming whitespace and removing wrapping backticks/quotes
const cleanUrl = (u) => {
  if (!u) return u;
  try {
    const s = String(u).trim().replace(/^`+|`+$/g, "").replace(/^"+|"+$/g, "");
    return s;
  } catch {
    return u;
  }
};

// Normalize and sanitize upload documents coming from client payload
const sanitizeUploadDocuments = (docs = []) => {
  return (docs || []).map((doc) => ({
    name: doc.name || doc.fileName,
    url: cleanUrl(doc.url || doc.fileUrl),
    fileType: doc.fileType || doc.type,
    fileSize: doc.fileSize || doc.size,
  }));
};

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    const body = await request.json();
    const { message, type, conversationId, businessDataId, uploadDocuments } = body || {};

    if (!message || !type) {
      return NextResponse.json(
        formatResponse(false, "Missing required fields: 'message' and 'type'"),
        { status: 400 }
      );
    }
    if (type !== "user") {
      return NextResponse.json(
        formatResponse(false, "Invalid 'type'. Only 'user' messages can be sent."),
        { status: 400 }
      );
    }

    // Fetch business data if ID is provided
    let businessDataContext = null;
    let documentAnalysis = null;
    
    
    // Handle uploaded documents from the request (sanitize first)
    if (uploadDocuments && uploadDocuments.length > 0) {
      try {
        const sanitizedDocs = sanitizeUploadDocuments(uploadDocuments);
        documentAnalysis = await analyzeMultipleDocuments(sanitizedDocs);
      } catch (error) {
        console.error("Error analyzing uploaded documents:", error);
        // Continue without document analysis if it fails
      }
    }
    
    if (businessDataId && auth.ok) {
      try {
        console.log("=== BUSINESS DATA RETRIEVAL START ===");
        console.log("Business Data ID:", businessDataId);
        console.log("User ID:", auth.user.id);
        
        const businessRecord = await BusinessData.findOne({
          _id: businessDataId,
          user: auth.user.id,
          status: "active",
        }).populate("category", "name");
        
        if (businessRecord) {
          console.log("Business record found:", businessRecord.businessName);
          businessDataContext = businessRecord;
          
          // Analyze uploaded documents if they exist (from business record)
          console.log("Checking for uploadDocuments...");
          console.log("uploadDocuments exists:", !!businessRecord.uploadDocuments);
          console.log("uploadDocuments length:", businessRecord.uploadDocuments?.length || 0);
          
          if (businessRecord.uploadDocuments && businessRecord.uploadDocuments.length > 0) {
            console.log("Found", businessRecord.uploadDocuments.length, "uploaded documents");
            console.log("Documents:", JSON.stringify(businessRecord.uploadDocuments.map(doc => ({
              name: doc.name,
              url: doc.url,
              fileType: doc.fileType,
              fileSize: doc.fileSize
            })), null, 2));
            
            try {
              const sanitizedBusinessDocs = sanitizeUploadDocuments(businessRecord.uploadDocuments);
              console.log("Sanitized documents:", JSON.stringify(sanitizedBusinessDocs, null, 2));
              
              console.log("Starting analysis of business documents...");
              const businessDocumentAnalysis = await analyzeMultipleDocuments(sanitizedBusinessDocs);
              console.log("Business document analysis completed. Results:", businessDocumentAnalysis?.length || 0);
              console.log("Analysis results:", JSON.stringify(businessDocumentAnalysis?.map(r => ({
                fileName: r.fileName,
                fileType: r.fileType,
                success: r.success,
                analysisLength: r.analysis?.length || 0
              })), null, 2));
              
              // Combine with request documents if both exist
              if (documentAnalysis && documentAnalysis.length > 0) {
                documentAnalysis = [...documentAnalysis, ...businessDocumentAnalysis];
                console.log("Combined document analysis. Total documents:", documentAnalysis.length);
              } else {
                documentAnalysis = businessDocumentAnalysis;
                console.log("Using business document analysis only. Total documents:", documentAnalysis.length);
              }
            } catch (error) {
              console.error("=== ERROR ANALYZING BUSINESS DOCUMENTS ===");
              console.error("Error:", error);
              console.error("Error message:", error.message);
              console.error("Error stack:", error.stack);
              // Continue without document analysis if it fails
            }
          } else {
            console.log("No uploadDocuments found in business record");
          }
        } else {
          console.log("Business record not found for ID:", businessDataId);
        }
        console.log("=== BUSINESS DATA RETRIEVAL END ===");
      } catch (error) {
        console.error("=== ERROR FETCHING BUSINESS DATA ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }

    // NOTE: We'll build the system prompt later in each branch after we have
    // combined any analyses from current request, business data, and conversation history.

    // Helper: normalize attachments from uploadDocuments
    const normalizeAttachments = (docs = []) => {
      return (docs || []).map((doc) => ({
        uid: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: doc.name || doc.fileName,
        url: cleanUrl(doc.url || doc.fileUrl),
        fileType: doc.fileType || doc.type,
        fileSize: doc.fileSize || doc.size,
      }));
    };

    // Anonymous temporary chat: allow without token, do NOT write to DB
    if (!auth.ok) {
      const systemPrompt = buildSystemPrompt(businessDataContext, documentAnalysis);
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });
      const aiText = completion?.choices?.[0]?.message?.content?.trim() || "";

      const result = {
        conversationId: null,
        messages: [
          {
            type: "user",
            message,
            attachments: normalizeAttachments(uploadDocuments),
            createdAt: new Date().toISOString(),
          },
          {
            type: "ai",
            message: aiText,
            createdAt: new Date().toISOString(),
          },
        ],
        ...(businessDataId && { businessDataId }),
      };

      return NextResponse.json(
        { success: true, message: "successfully", ...result, data: result, count: { totalPage: 0, currentPageSize: 2 } },
        { status: 200 }
      );
    }

    const { id: userId, name: userName } = auth.user;

    // Continue existing conversation (authenticated)
    if (conversationId) {
      const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

      if (!conversation) {
        return NextResponse.json(formatResponse(false, "Invalid conversationId"), { status: 404 });
      }

      const userMsg = await Message.create({
        conversation: conversation._id,
        type: "user",
        message,
        user: { id: userId, name: userName },
        attachments: normalizeAttachments(uploadDocuments),
      });

      // Fetch latest messages for context (up to 20), then order chronologically
      const historyDesc = await Message.find({ conversation: conversation._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      const history = [...historyDesc].reverse();

      // Collect attachments from conversation history (last 20 messages), dedupe by URL
      let historyDocs = [];
      try {
        const attachList = history
          .filter((m) => Array.isArray(m.attachments) && m.attachments.length > 0)
          .flatMap((m) => m.attachments);
        const byUrl = new Map();
        for (const att of attachList) {
          const name = att.name || att.fileName;
          const fileType = att.fileType || att.type;
          const url = cleanUrl(att.url || att.fileUrl);
          if (!url || !fileType) continue;
          const key = url.trim().toLowerCase();
          if (!byUrl.has(key)) {
            byUrl.set(key, { name, url, fileType, fileSize: att.fileSize || att.size });
          }
        }
        // Limit to first 10 distinct attachments to cap processing
        historyDocs = Array.from(byUrl.values()).slice(0, 10);
      } catch (e) {
        console.error("Failed to collect history attachments:", e);
        historyDocs = [];
      }

      // Analyze conversation history attachments if present
      let historyAnalysis = [];
      if (historyDocs.length > 0) {
        try {
          historyAnalysis = await analyzeMultipleDocuments(historyDocs);
        } catch (e) {
          console.error("Error analyzing history documents:", e);
          historyAnalysis = [];
        }
      }

      // Combine all analyses: request uploads + business docs + history docs
      const combinedAnalysis = (() => {
        const arr = [];
        if (Array.isArray(documentAnalysis) && documentAnalysis.length > 0) arr.push(...documentAnalysis);
        if (Array.isArray(historyAnalysis) && historyAnalysis.length > 0) arr.push(...historyAnalysis);
        return arr;
      })();

      console.log("=== FINAL DOCUMENT ANALYSIS SUMMARY ===");
      console.log("Combined analysis count:", combinedAnalysis.length);
      console.log("Document analysis count:", documentAnalysis?.length || 0);
      console.log("History analysis count:", historyAnalysis?.length || 0);
      console.log("Combined analysis details:", JSON.stringify(combinedAnalysis.map(a => ({
        fileName: a.fileName,
        fileType: a.fileType,
        success: a.success,
        analysisLength: a.analysis?.length || 0
      })), null, 2));

      const systemPrompt = buildSystemPrompt(businessDataContext, combinedAnalysis);
      console.log("=== SYSTEM PROMPT ===");
      console.log("System prompt length:", systemPrompt.length);
      console.log("System prompt preview (first 1000 chars):", systemPrompt.substring(0, 1000));
      console.log("Contains document analysis:", systemPrompt.includes("UPLOADED DOCUMENTS ANALYSIS"));
      
      const chatMessages = [
        { role: "system", content: systemPrompt },
        ...history.map((m) =>
          m.type === "user"
            ? { role: "user", content: m.message }
            : { role: "assistant", content: m.message }
        ),
        { role: "user", content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: chatMessages,
      });
      const aiText = completion?.choices?.[0]?.message?.content?.trim() || "";

      const aiMsg = await Message.create({
        conversation: conversation._id,
        type: "ai",
        message: aiText,
      });

      const result = {
        conversationId: String(conversation._id),
        messages: [
          {
            type: "user",
            user: { id: String(userId), name: userName },
            message: userMsg.message,
            attachments: userMsg.attachments,
            createdAt: userMsg.createdAt,
          },
          {
            type: "ai",
            message: aiMsg.message,
            createdAt: aiMsg.createdAt,
          },
        ],
        ...(businessDataId && { businessDataId }),
      };

      return NextResponse.json(
        { success: true, message: "successfully", ...result, data: result, count: { totalPage: 0, currentPageSize: 2 } },
        { status: 200 }
      );
    }

    // Create new conversation (authenticated)
    const conversation = await Conversation.create({ 
      user: userId,
      businessData: businessDataId || null
    });

    const firstUserMsg = await Message.create({
      conversation: conversation._id,
      type: "user",
      message,
      user: { id: userId, name: userName },
      attachments: normalizeAttachments(uploadDocuments),
    });

    // Update first message pointer for preview lists
    conversation.firstMessageId = firstUserMsg._id;
    await conversation.save();

    console.log("=== FINAL DOCUMENT ANALYSIS SUMMARY (NEW CONVERSATION) ===");
    console.log("Document analysis count:", documentAnalysis?.length || 0);
    console.log("Document analysis details:", JSON.stringify(documentAnalysis?.map(a => ({
      fileName: a.fileName,
      fileType: a.fileType,
      success: a.success,
      analysisLength: a.analysis?.length || 0
    })) || [], null, 2));

    const systemPrompt = buildSystemPrompt(businessDataContext, documentAnalysis);
    console.log("=== SYSTEM PROMPT (NEW CONVERSATION) ===");
    console.log("System prompt length:", systemPrompt.length);
    console.log("System prompt preview (first 1000 chars):", systemPrompt.substring(0, 1000));
    console.log("Contains document analysis:", systemPrompt.includes("UPLOADED DOCUMENTS ANALYSIS"));
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });
    const aiText = completion?.choices?.[0]?.message?.content?.trim() || "";

    const firstAiMsg = await Message.create({
      conversation: conversation._id,
      type: "ai",
      message: aiText,
    });

    const newResult = {
      conversationId: String(conversation._id),
      messages: [
        {
          type: "user",
          user: { id: String(userId), name: userName },
          message: firstUserMsg.message,
          attachments: firstUserMsg.attachments,
          createdAt: firstUserMsg.createdAt,
        },
        {
          type: "ai",
          message: firstAiMsg.message,
          createdAt: firstAiMsg.createdAt,
        },
      ],
      ...(businessDataId && { businessDataId }),
    };

  return NextResponse.json(
  {
    success: true,
    message: "successfully",
    conversationId: String(conversation._id),
    messages: newResult.messages.map(m => ({
      type: m.type,
      message: m.message,
      createdAt: m.createdAt,
      attachments: m.attachments?.slice(0, 3) || []
    })),
    businessDataId: newResult.businessDataId || null
  },
  { status: 200 }
);

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}