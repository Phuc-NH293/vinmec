export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  status: PostStatus;
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type PostInput = Omit<Post, "id" | "updatedAt" | "publishedAt"> & {
  publishedAt?: string | null;
};
