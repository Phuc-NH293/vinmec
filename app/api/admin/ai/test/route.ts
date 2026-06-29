import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAiConfig } from "@/lib/ai-config";
import { testGeminiConnection } from "@/lib/gemini-provider";

export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getAiConfig();
  const result = await testGeminiConnection(config.model);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
