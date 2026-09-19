import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Check for predefined Mithila Academy location question
function isMithilaAcademyLocationQuestion(query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase().trim();
  const mentionsMithila =
    q.includes("mithila") ||
    q.includes("academy") ||
    q.includes("संस्थान") ||
    q.includes("मिथिला");
  const mentionsLocation =
    q.includes("kaha") ||
    q.includes("kahan") ||
    q.includes("sthit") ||
    q.includes("location") ||
    q.includes("address") ||
    q.includes("pata") ||
    q.includes("where") ||
    q.includes("kidhar") ||
    q.includes("कहाँ") ||
    q.includes("कहा") ||
    q.includes("स्थित");
  return (
    (mentionsMithila && mentionsLocation) ||
    q === "mithila academy" ||
    q.includes("mithila academy location") ||
    q.includes("mithila academy kaha") ||
    q.includes("where is mithila academy")
  );
}

const MITHILA_LOCATION_ANSWER = "Mithila Academy Kauriyahi Village mein sthit hai.\n\nSurendra Sir ke anusar.";

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Mithila Academy AI",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper to sanitize and remove spurious or random meaningless symbols
function sanitizeCleanText(rawText: string): string {
  if (!rawText) return "";
  let text = rawText;

  // Remove random or unnecessary symbols such as "':;&€¥$¢" or spurious symbol sequences
  // We keep standard punctuation (. , ? ! - : ; " ') only in valid sentence positions,
  // and essential math symbols (+ - * / = % ^ √ () [] {})
  text = text.replace(/[€¥¢§¶~`\\]/g, "");

  // Remove isolated clusters of mixed random punctuation like "':;& or &$^ or ;;&
  text = text.replace(/["':;&]{3,}/g, " ");

  // Remove random leading/trailing isolated quotes or colons on lines
  text = text.replace(/(^|\n)["'`]+([a-zA-Z0-9\u0900-\u097F])/g, "$1$2");
  text = text.replace(/([a-zA-Z0-9\u0900-\u097F])["'`]+(\n|$)/g, "$1$2");

  // Collapse multiple spaces
  text = text.replace(/[ \t]{2,}/g, " ");

  return text.trim();
}

// Helper to strictly ensure the signature is only at the end
function enforceSurendraSirSignature(rawText: string): string {
  const targetSignature = "Surendra Sir ke anusar.";
  
  // Clean output symbols first
  let cleaned = sanitizeCleanText(rawText);

  // Remove any occurrences of the signature inside the text
  const regex = /Surendra\s+Sir\s+ke\s+anusar[\.!\s]*/gi;
  cleaned = cleaned.replace(regex, "").trim();

  // If text ends with stray punctuation like trailing dashes or asterisks, trim them
  cleaned = cleaned.replace(/[\s\-_*]+$/, "");

  // Append exactly at the very end on its own line
  return `${cleaned}\n\n${targetSignature}`;
}

const SYSTEM_INSTRUCTION_BASE = `You are the dedicated educational AI assistant inside "Mithila Academy AI", created to guide students academically under the pedagogy and wisdom of Surendra Sir.

CORE MISSION & PEDAGOGY:
- Your absolute priority is correctness, academic clarity, step-by-step guidance, and student-friendly explanations.
- Never knowingly provide a false answer, fake formula, or invented citation.
- If you are uncertain about any fact, calculation, or question, state clearly and honestly that you are uncertain instead of inventing information.

FAST, ACCURATE & RELEVANT ANSWERS:
- Understand the user's actual question before answering.
- Give the answer specifically to the question asked. Do not add unrelated information.
- For academic questions, give the correct answer with a short explanation.
- If the question is unclear, ask for clarification instead of guessing.
- Never fabricate sources, searches, facts, or results.

ANSWER LENGTH & CONCISENESS (MEDIUM/SHORT DEFAULT):
- Use a MEDIUM/SHORT answer style by default:
  • Simple question → 1–3 concise sentences.
  • Normal academic question → short explanation with the key steps.
  • Difficult question → enough explanation to understand it, but avoid unnecessary long paragraphs.
- Do NOT repeat the user's question unnecessarily.
- Do NOT add filler or preamble. Jump directly into the solution.

CLEAN TEXT OUTPUT (STRICT):
- Do NOT produce random or unnecessary symbols such as: "':;&€¥$¢" or other meaningless special characters.
- Use normal punctuation only when needed.
- Do NOT insert random symbols into answers.
- Keep mathematical symbols only when they are genuinely required for the question.
- Keep answers clean and easy to read.

MITHILA ACADEMY LOCATION RULE (PREDEFINED FACT):
- When the student asks where Mithila Academy is located (e.g., "Mithila Academy kaha hai?", "Mithila Academy kahan sthit hai?", "Where is Mithila Academy?", etc.):
  You MUST answer: "Mithila Academy Kauriyahi Village mein sthit hai."
  Do not invent a different location.

PHOTO / IMAGE QUESTION SOLVING:
- When the student shares an image (photo of a textbook, question paper, worksheet, diagram, or handwritten problem):
  1. Accurately transcribe and identify the question text and mathematical/scientific figures.
  2. Provide a structured, step-by-step explanation and the final solution clearly and concisely.
  3. Keep the language simple, encouraging, and clean.

LANGUAGE RULES:
- If the student asks in Hindi, answer in simple, polite, easy-to-understand Hindi (Devanagari or Hinglish depending on their question script).
- If the student asks in Hinglish (Hindi words in English alphabet), answer in warm, natural Hinglish so they grasp the concept easily.
- If the student asks in English, respond in clear, articulate, grammatically correct English.
- If the student asks in Maithili, answer politely in Maithili/Hindi.

SUBJECT GUIDANCE:
1. Mathematics:
   - Provide clear step-by-step calculations.
   - Mention the formula used explicitly.
   - State the final result clearly.
2. Science (Physics, Chemistry, Biology):
   - Explain scientific concepts simply with everyday examples and analogies.
   - Highlight definitions, SI units, and chemical equations where applicable.
3. Social Studies, History & Geography:
   - Give structured, easy-to-remember points and chronological context.
4. Languages (Hindi & English Grammar/Literature):
   - Provide rule explanations with clear examples.

MANDATORY SIGN-OFF RULE (STRICT):
- Every AI answer MUST end with exactly:
“Surendra Sir ke anusar.”
- Do NOT add this phrase in the middle or beginning of your answer. Place it strictly as the very last line.`;

// Ultra-fast prioritized models for minimum response latency (~800ms)
const CANDIDATE_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
];

// Streaming educational question answering API (SSE)
app.post("/api/ask-stream", async (req, res) => {
  const { question, image, conversationHistory = [], studentLevel } = req.body;

  if ((!question || typeof question !== "string" || !question.trim()) && !image) {
    return res.status(400).json({ error: "Please provide a valid question or photo." });
  }

  const effectiveQuestion = typeof question === "string" ? question.trim() : "";

  // Predefined check for Mithila Academy location
  if (isMithilaAcademyLocationQuestion(effectiveQuestion)) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`data: ${JSON.stringify({ type: "chunk", text: MITHILA_LOCATION_ANSWER })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done", answer: MITHILA_LOCATION_ANSWER, question: effectiveQuestion, timestamp: Date.now() })}\n\n`);
    return res.end();
  }

  const ai = getAi();
  if (!ai) {
    return res.status(503).json({
      error: "AI service is currently initializing. Please check GEMINI_API_KEY.",
    });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Helper to send SSE event
  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentTurns = conversationHistory.slice(-4);
      for (const turn of recentTurns) {
        if (turn.role === "user") {
          contents.push({ role: "user", parts: [{ text: turn.text }] });
        } else if (turn.role === "assistant") {
          contents.push({ role: "model", parts: [{ text: turn.text }] });
        }
      }
    }

    const userParts: any[] = [];

    // Parse image if provided
    if (image) {
      let base64Data = "";
      let mimeType = "image/jpeg";
      if (typeof image === "string") {
        const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        } else {
          base64Data = image;
        }
      } else if (image.data) {
        base64Data = image.data;
        mimeType = image.mimeType || "image/jpeg";
      }

      if (base64Data) {
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }
    }

    const promptText = effectiveQuestion || "Yeh student dwara bheji gayi question ki photo/worksheet/handwritten problem hai. Kripya is prashn ko dhyan se padhein aur iska step-by-step saral aur spasht shaikshanik uttar samjhaiye.";
    userParts.push({ text: promptText });

    contents.push({ role: "user", parts: userParts });

    const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\nTarget Student Level: ${studentLevel || "secondary school"}`;

    let streamSuccess = false;
    let accumulatedText = "";

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            topP: 0.9,
          },
        });

        for await (const chunk of stream) {
          const chunkText = chunk.text || "";
          if (chunkText) {
            accumulatedText += chunkText;
            sendEvent({ type: "chunk", text: chunkText });
          }
        }

        streamSuccess = true;
        break;
      } catch (err: any) {
        console.warn(`Stream with ${modelName} failed:`, err?.status || err?.message);
        // Continue to fallback model if nothing has been streamed yet
        if (accumulatedText.length > 0) {
          break;
        }
      }
    }

    if (!streamSuccess && !accumulatedText) {
      // Fallback single generation if stream wasn't able to establish
      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.3,
              topP: 0.9,
            },
          });
          if (response.text) {
            accumulatedText = response.text;
            sendEvent({ type: "chunk", text: accumulatedText });
            break;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (!accumulatedText) {
      accumulatedText = "Main is prashn ka spasht uttar nahi de paa raha hoon. Kripya apna prashn dobara puchen.";
    }

    // Ensure final signature
    const finalizedAnswer = enforceSurendraSirSignature(accumulatedText);
    sendEvent({
      type: "done",
      answer: finalizedAnswer,
      question: effectiveQuestion || "Photo Question",
      timestamp: Date.now(),
    });

    res.end();
  } catch (error: any) {
    console.error("Stream generation error:", error);
    sendEvent({
      type: "error",
      error: "Mithila Academy AI could not complete this answer. Please try again.",
    });
    res.end();
  }
});

// Educational question answering API (Standard JSON endpoint)
app.post("/api/ask", async (req, res) => {
  const { question, image, conversationHistory = [], studentLevel } = req.body;

  if ((!question || typeof question !== "string" || !question.trim()) && !image) {
    return res.status(400).json({ error: "Please provide a valid question or photo." });
  }

  const effectiveQuestion = typeof question === "string" ? question.trim() : "";

  // Predefined check for Mithila Academy location
  if (isMithilaAcademyLocationQuestion(effectiveQuestion)) {
    return res.json({
      status: "success",
      answer: MITHILA_LOCATION_ANSWER,
      question: effectiveQuestion,
      timestamp: Date.now(),
    });
  }

  const ai = getAi();
  if (!ai) {
    return res.status(503).json({
      error: "AI service is currently initializing. Please configure your GEMINI_API_KEY in the Settings menu.",
    });
  }

  const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\nTarget Student Level: ${studentLevel || "secondary school"}`;

  try {
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentTurns = conversationHistory.slice(-4);
      for (const turn of recentTurns) {
        if (turn.role === "user") {
          contents.push({ role: "user", parts: [{ text: turn.text }] });
        } else if (turn.role === "assistant") {
          contents.push({ role: "model", parts: [{ text: turn.text }] });
        }
      }
    }

    const userParts: any[] = [];

    // Parse image if provided
    if (image) {
      let base64Data = "";
      let mimeType = "image/jpeg";
      if (typeof image === "string") {
        const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        } else {
          base64Data = image;
        }
      } else if (image.data) {
        base64Data = image.data;
        mimeType = image.mimeType || "image/jpeg";
      }

      if (base64Data) {
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }
    }

    const promptText = effectiveQuestion || "Yeh student dwara bheji gayi question ki photo/worksheet/handwritten problem hai. Kripya is prashn ko dhyan se padhein aur iska step-by-step saral aur spasht shaikshanik uttar samjhaiye.";
    userParts.push({ text: promptText });

    contents.push({ role: "user", parts: userParts });

    let lastError: any = null;
    let generatedText: string | null = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            topP: 0.9,
          },
        });

        if (response.text) {
          generatedText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} call returned:`, err?.status || err?.message || err);
      }
    }

    if (!generatedText) {
      if (lastError) {
        throw lastError;
      }
      generatedText = "Main is prashn ka spasht uttar nahi de paa raha hoon. Kripya apna prashn dobara puchen.";
    }

    const rawText = generatedText;
    const finalizedAnswer = enforceSurendraSirSignature(rawText);

    res.setHeader("Content-Type", "application/json");
    return res.json({
      status: "success",
      answer: finalizedAnswer,
      question: effectiveQuestion || "Photo Question",
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = error?.message || "Failed to generate answer";

    let studentFriendlyMessage = "Mithila Academy AI could not process this question right now. Please check your connection and try again.";
    if (error?.status === "UNAVAILABLE" || error?.code === 503 || (typeof errorMessage === "string" && errorMessage.includes("503"))) {
      studentFriendlyMessage = "AI server par abhi adhik load hai. Kripya 'Retry' button dabayein.";
    } else if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429) {
      studentFriendlyMessage = "Request limit reached. Kripya kuch pal baad dubara koshish karein.";
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(503).json({
      error: studentFriendlyMessage,
      details: errorMessage,
    });
  }
});

async function startServer() {
  // Setup Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mithila Academy AI server running on port ${PORT}`);
  });
}

startServer();
