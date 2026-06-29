import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { deletePost, updatePost } from "@/lib/posts";
import type { PostInput } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const input = (await request.json()) as PostInput;
  if (!input.title?.trim() || !input.content?.trim() || !input.excerpt?.trim()) {
    return NextResponse.json(
      { error: "Vui lòng nhập đủ tiêu đề, mô tả và nội dung." },
      { status: 400 },
    );
  }
  const post = await updatePost(id, input);
  if (!post) {
    return NextResponse.json(
      { error: "Không tìm thấy bài viết." },
      { status: 404 },
    );
  }
  revalidatePath("/");
  revalidatePath("/tin-tuc");
  revalidatePath(`/tin-tuc/${post.slug}`);
  return NextResponse.json(post);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const removed = await deletePost(id);
  if (removed) {
    revalidatePath("/");
    revalidatePath("/tin-tuc");
  }
  return removed
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
}
