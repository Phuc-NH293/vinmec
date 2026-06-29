import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteKnowledgeDocument } from "@/lib/ai-knowledge";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  return (await deleteKnowledgeDocument(id))
    ? NextResponse.json({ ok: true })
    : NextResponse.json(
        { error: "Không tìm thấy tài liệu." },
        { status: 404 },
      );
}
