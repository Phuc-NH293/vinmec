import { GoogleGenAI } from "@google/genai";

const MEDICAL_TERMS = [
  "y te",
  "suc khoe",
  "benh",
  "trieu chung",
  "dau",
  "sot",
  "ho",
  "kho tho",
  "chong mat",
  "met moi",
  "thuoc",
  "lieu dung",
  "bac si",
  "benh vien",
  "phong kham",
  "vinmec",
  "dat lich",
  "kham",
  "chuyen khoa",
  "xet nghiem",
  "sieu am",
  "noi soi",
  "phau thuat",
  "dieu tri",
  "chan doan",
  "bao hiem",
  "cap cuu",
  "dinh duong",
  "thai",
  "san khoa",
  "nhi khoa",
  "tim mach",
  "huyet ap",
  "tieu duong",
  "ung thu",
  "da lieu",
  "rang",
  "than kinh",
  "co xuong khop",
  "tieu hoa",
  "gan",
  "than",
  "phoi",
  "vaccine",
  "tiem chung",
  "medical",
  "health",
  "doctor",
  "hospital",
  "symptom",
  "medicine",
  "treatment",
];

const NON_MEDICAL_TERMS = [
  "lap trinh",
  "code",
  "javascript",
  "python",
  "nextjs",
  "bong da",
  "the thao",
  "phim",
  "am nhac",
  "bai hat",
  "chinh tri",
  "chung khoan",
  "crypto",
  "bitcoin",
  "ty gia",
  "thoi tiet",
  "du lich",
  "nau an",
  "tinh yeu",
  "game",
  "toan hoc",
  "giai phuong trinh",
  "viet van",
  "programming",
  "football",
  "movie",
  "music",
];

const HARD_NON_MEDICAL_INTENTS = [
  "viet code",
  "lap trinh",
  "giai phuong trinh",
  "du doan bong da",
  "phan tich chung khoan",
  "gia bitcoin",
  "viet van",
  "sang tac bai hat",
  "review phim",
];

const SOCIAL_OPENINGS = [
  "xin chao",
  "chao",
  "hello",
  "hi",
  "hey",
  "alo",
  "cam on",
  "thank you",
  "thanks",
];

const SOCIAL_FILLER_WORDS = new Set([
  "a",
  "ad",
  "admin",
  "anh",
  "bac",
  "ban",
  "bot",
  "buoi",
  "chi",
  "chieu",
  "co",
  "em",
  "minh",
  "moi",
  "nha",
  "nhe",
  "nguoi",
  "oi",
  "sang",
  "si",
  "toi",
  "tro",
  "trua",
  "ly",
  "vinmec",
]);

export type ChatIntent = "social" | "medical" | "other";

export const OUT_OF_SCOPE_REPLY =
  "Xin lỗi, tôi là trợ lý AI chuyên về y tế và dịch vụ Vinmec nên không thể trả lời chủ đề này. Bạn có thể hỏi tôi về sức khỏe, triệu chứng, chuyên khoa, bác sĩ hoặc đặt lịch khám.";

export function normalizeIntentText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSocialMessage(message: string) {
  const normalized = normalizeIntentText(message);
  const opening = SOCIAL_OPENINGS.find(
    (candidate) =>
      normalized === candidate || normalized.startsWith(`${candidate} `),
  );
  if (!opening) return false;

  const remainder = normalized.slice(opening.length).trim();
  return (
    !remainder ||
    remainder.split(" ").every((word) => SOCIAL_FILLER_WORDS.has(word))
  );
}

export function isClearlyNonMedical(message: string) {
  const normalized = normalizeIntentText(message);
  return (
    HARD_NON_MEDICAL_INTENTS.some((term) => normalized.includes(term)) ||
    NON_MEDICAL_TERMS.some((term) => normalized.includes(term))
  );
}

export async function classifyChatIntent(
  message: string,
  model: string,
  conversationContext = "",
): Promise<ChatIntent> {
  const normalized = normalizeIntentText(message);
  if (!normalized) return "other";
  if (isSocialMessage(normalized)) return "social";

  if (isClearlyNonMedical(normalized)) return "other";
  if (MEDICAL_TERMS.some((term) => normalized.includes(term))) return "medical";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "other";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: `Phân loại tin nhắn hiện tại có thuộc lĩnh vực y tế, sức khỏe, chăm sóc bệnh nhân, bệnh viện, bác sĩ, thuốc, bảo hiểm y tế hoặc dịch vụ khám chữa bệnh hay không. Nếu tin nhắn là câu trả lời ngắn cho một câu hỏi y tế trong ngữ cảnh hội thoại thì vẫn phân loại là MEDICAL.

Ngữ cảnh hội thoại gần nhất:
${conversationContext || "Không có"}

Tin nhắn hiện tại: ${message}

Chỉ trả về đúng một từ: MEDICAL hoặc OTHER.`,
      config: {
        maxOutputTokens: 10,
      },
    });
    return response.text?.trim().toUpperCase().startsWith("MEDICAL")
      ? "medical"
      : "other";
  } catch {
    return "other";
  }
}

export async function isMedicalQuestion(message: string, model: string) {
  return (await classifyChatIntent(message, model)) === "medical";
}
