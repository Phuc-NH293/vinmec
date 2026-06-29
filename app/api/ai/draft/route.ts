import { NextResponse } from "next/server";
import { generateArticleDraft } from "@/lib/ai";
import { getAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await generateArticleDraft(await request.json());
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI_SERVICE_ERROR";
    return NextResponse.json(
      {
        error:
          message === "AI_NOT_CONFIGURED"
            ? "Gemini chưa được cấu hình. Thêm GEMINI_API_KEY để kích hoạt."
            : "Không thể tạo bản nháp bằng Gemini.",
      },
      { status: 501 },
    );
  }
}
