import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());

// Multer config (keep file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// OpenAI client (for rewriting prompts)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- Helper: Prompt Rewriting ----
async function rewritePrompt({
  videoType,
  mood,
  style,
  placement,
  customPrompt,
}) {
  let baseDescription = `
    Video type: ${videoType || "Not specified"}
    Mood: ${mood || "Not specified"}
    Style: ${style || "Not specified"}
    Placement: ${placement || "Not specified"}
  `;
  if (customPrompt && customPrompt.trim() !== "") {
    baseDescription += `\nUser Custom Prompt: ${customPrompt}`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI that rewrites thumbnail prompts. Combine all inputs into one concise but descriptive image prompt.",
      },
      { role: "user", content: baseDescription },
    ],
  });

  return response.choices[0].message.content;
}

// ---- Upload Route ----
app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    const { videoType, mood, style, placement, customPrompt, outputFormat } =
      req.body;
    const photo = req.file;

    // Step 1: Rewrite Prompt
    const rewrittenPrompt = await rewritePrompt({
      videoType,
      mood,
      style,
      placement,
      customPrompt,
    });

    console.log("Rewritten Prompt:", rewrittenPrompt);

    // Step 2: Decide size based on user choice
    let size;
    if (outputFormat === "shorts") {
      size = "1080x1920"; // vertical
    } else {
      size = "1280x720"; // horizontal
    }

    // Step 3: Send photo + prompt to Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: photo.buffer.toString("base64"),
          mimeType: photo.mimetype,
        },
      },
      { text: `${rewrittenPrompt}. Generate image in resolution ${size}` },
    ]);

    const response = result.response;

    let images = [];
    if (response.candidates && response.candidates.length > 0) {
      images = response.candidates
        .map((c) => c.content?.parts?.find((p) => p.inlineData))
        .filter(Boolean)
        .map(
          (p) => `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`
        );
    }

    res.json({
      message: "Thumbnails generated!",
      rewrittenPrompt,
      outputFormat,
      images,
    });
  } catch (err) {
    console.error("Error in /upload:", err);
    res.status(500).json({ error: "Something went wrong with Gemini" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
