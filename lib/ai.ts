import { GoogleGenAI } from "@google/genai";
import { getAiConfig } from "@/lib/ai-config";

export type DraftRequest = {
  topic: string;
  category?: string;
  tone?: string;
};

export async function generateArticleDraft(_input: DraftRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_NOT_CONFIGURED");
  }
  const config = await getAiConfig();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: config.model || "gemini-2.5-flash",
    contents: `Viết bản nháp bài sức khỏe bằng tiếng Việt.
Chủ đề: ${_input.topic}
Chuyên mục: ${_input.category || "Sống khỏe"}
Giọng văn: ${_input.tone || "dễ hiểu, đáng tin cậy"}

Trả về JSON thuần với cấu trúc:
{"title":"...","excerpt":"...","content":"..."}
Content dùng Markdown đơn giản, có các tiêu đề ##. Không tự chẩn đoán hoặc kê đơn.`,
    config: {
      systemInstruction: config.systemPrompt,
      responseMimeType: "application/json",
      maxOutputTokens: 2500,
    },
  });
  const text = response.text?.trim();
  if (!text) throw new Error("EMPTY_PROVIDER_RESPONSE");
  return JSON.parse(text) as {
    title: string;
    excerpt: string;
    content: string;
  };
}
