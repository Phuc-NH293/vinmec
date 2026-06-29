import { NextResponse } from "next/server";
import { runVinmecAgent } from "@/lib/agent/vinmec-agent";
import type { AgentLocation } from "@/lib/agent/types";
import type { ChatMessage } from "@/lib/ai-types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    history?: ChatMessage[];
    location?: AgentLocation;
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

  const location =
    typeof body.location?.lat === "number" &&
    typeof body.location?.lon === "number"
      ? body.location
      : undefined;

  return NextResponse.json(
    await runVinmecAgent({
      message,
      history: body.history ?? [],
      location,
    }),
  );
}
