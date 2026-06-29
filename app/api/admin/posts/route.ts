import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { createPost, getPosts } from "@/lib/posts";
import type { PostInput } from "@/lib/types";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getPosts({ includeDrafts: true }));
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const input = (await request.json()) as PostInput;
  if (!input.title?.trim() || !input.content?.trim() || !input.excerpt?.trim()) {
    return NextResponse.json(
      { error: "Vui lòng nhập đủ tiêu đề, mô tả và nội dung." },
      { status: 400 },
    );
  }
  const post = await createPost(input);
  revalidatePath("/");
  revalidatePath("/tin-tuc");
  return NextResponse.json(post, { status: 201 });
}
