import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  addKnowledgeDocument,
  listKnowledgeDocuments,
} from "@/lib/ai-knowledge";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await listKnowledgeDocuments());
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File);
  if (!files.length) {
    return NextResponse.json(
      { error: "Chưa chọn tài liệu." },
      { status: 400 },
    );
  }
  if (files.length > 10) {
    return NextResponse.json(
      { error: "Chỉ tải tối đa 10 tài liệu mỗi lần." },
      { status: 400 },
    );
  }

  try {
    const uploaded = [];
    for (const file of files) {
      uploaded.push(await addKnowledgeDocument(file));
    }
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const messages: Record<string, string> = {
      EMPTY_FILE: "Tài liệu rỗng.",
      FILE_TOO_LARGE: "Mỗi tài liệu không được vượt quá 10 MB.",
      UNSUPPORTED_FILE: "Chỉ hỗ trợ PDF, DOCX, TXT và Markdown.",
      NO_TEXT_FOUND: "Không trích xuất được nội dung chữ từ tài liệu.",
    };
    return NextResponse.json(
      { error: messages[code] || "Không thể xử lý tài liệu." },
      { status: 400 },
    );
  }
}
