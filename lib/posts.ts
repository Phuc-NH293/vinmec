import { promises as fs } from "fs";
import path from "path";
import type { Post, PostInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

const postsFile = path.join(process.cwd(), "data", "posts.json");

async function readAll(): Promise<Post[]> {
  const raw = await fs.readFile(postsFile, "utf8");
  return JSON.parse(raw) as Post[];
}

async function writeAll(posts: Post[]) {
  await fs.writeFile(postsFile, JSON.stringify(posts, null, 2), "utf8");
}

export async function getPosts(options?: {
  includeDrafts?: boolean;
  query?: string;
  category?: string;
}) {
  let posts = await readAll();
  if (!options?.includeDrafts) {
    posts = posts.filter((post) => post.status === "published");
  }
  if (options?.query) {
    const query = options.query.toLocaleLowerCase("vi");
    posts = posts.filter(
      (post) =>
        post.title.toLocaleLowerCase("vi").includes(query) ||
        post.excerpt.toLocaleLowerCase("vi").includes(query),
    );
  }
  if (options?.category) {
    posts = posts.filter((post) => post.category === options.category);
  }
  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.updatedAt).getTime() -
      new Date(a.publishedAt ?? a.updatedAt).getTime(),
  );
}

export async function getPostBySlug(slug: string) {
  const posts = await readAll();
  return posts.find(
    (post) => post.slug === slug && post.status === "published",
  );
}

export async function getPostById(id: string) {
  const posts = await readAll();
  return posts.find((post) => post.id === id);
}

export async function createPost(input: PostInput) {
  const posts = await readAll();
  const now = new Date().toISOString();
  const baseSlug = slugify(input.slug || input.title);
  let slug = baseSlug;
  let suffix = 2;
  while (posts.some((post) => post.slug === slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }
  const post: Post = {
    ...input,
    id: crypto.randomUUID(),
    slug,
    publishedAt:
      input.status === "published" ? input.publishedAt || now : null,
    updatedAt: now,
  };
  posts.push(post);
  await writeAll(posts);
  return post;
}

export async function updatePost(id: string, input: PostInput) {
  const posts = await readAll();
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return null;
  const existing = posts[index];
  const desiredSlug = slugify(input.slug || input.title);
  const duplicate = posts.some(
    (post) => post.id !== id && post.slug === desiredSlug,
  );
  const slug = duplicate ? `${desiredSlug}-${id.slice(0, 6)}` : desiredSlug;
  posts[index] = {
    ...existing,
    ...input,
    slug,
    publishedAt:
      input.status === "published"
        ? existing.publishedAt || new Date().toISOString()
        : null,
    updatedAt: new Date().toISOString(),
  };
  await writeAll(posts);
  return posts[index];
}

export async function deletePost(id: string) {
  const posts = await readAll();
  const nextPosts = posts.filter((post) => post.id !== id);
  if (nextPosts.length === posts.length) return false;
  await writeAll(nextPosts);
  return true;
}
