import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAiConfig, saveAiConfig } from "@/lib/ai-config";
import type { AiConfig } from "@/lib/ai-types";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ...(await getAiConfig()),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
}

export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const input = (await request.json()) as AiConfig;
  if (
    !["knowledge_only", "knowledge_then_llm", "llm_only"].includes(input.mode)
  ) {
    return NextResponse.json(
      { error: "Chế độ AI không hợp lệ." },
      { status: 400 },
    );
  }
  return NextResponse.json(await saveAiConfig(input));
}
