import { NextResponse } from "next/server";
import { answerChat } from "@/lib/ai-chat";
import type { ChatMessage } from "@/lib/ai-types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    history?: ChatMessage[];
  };
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json(
      { error: "Vui lòng nhập câu hỏi." },
      { status: 400 },
    );
  }
  if (message.length > 2000) {
    return NextResponse.json(
      { error: "Câu hỏi quá dài." },
      { status: 400 },
    );
  }
  return NextResponse.json(await answerChat(message, body.history ?? []));
}
