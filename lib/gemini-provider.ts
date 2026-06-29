import { GoogleGenAI } from "@google/genai";

export function getGeminiErrorMessage(error: unknown) {
  const raw =
    error instanceof Error ? error.message : String(error ?? "UNKNOWN_ERROR");
  const normalized = raw.toLowerCase();
  if (
    normalized.includes("api key not valid") ||
    normalized.includes("api_key_invalid") ||
    normalized.includes("invalid api key")
  ) {
    return "Gemini API key không hợp lệ. Hãy dùng key được tạo từ Google AI Studio.";
  }
  if (
    normalized.includes("not found") ||
    normalized.includes("not supported") ||
    normalized.includes("model")
  ) {
    return "Model Gemini hiện tại không khả dụng với API key này. Hãy thử gemini-2.5-flash hoặc kiểm tra lại API key trong Google AI Studio.";
  }
  if (
    normalized.includes("429") ||
    normalized.includes("quota") ||
    normalized.includes("resource_exhausted")
  ) {
    return "Gemini đã hết hạn mức hoặc đang bị giới hạn tần suất.";
  }
  return "Không thể kết nối Gemini. Hãy kiểm tra API key, model và kết nối mạng.";
}

export async function testGeminiConnection(model: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      message: "Chưa có GEMINI_API_KEY trong .env.local.",
    };
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: "Reply with exactly: OK",
      config: {
        maxOutputTokens: 10,
      },
    });
    return {
      ok: Boolean(response.text?.trim()),
      message: response.text?.trim()
        ? `Kết nối thành công với ${model}.`
        : "Gemini không trả về nội dung.",
    };
  } catch (error) {
    return { ok: false, message: getGeminiErrorMessage(error) };
  }
}
