import { PostsTable } from "@/components/posts-table";
import { getPosts } from "@/lib/posts";

export default async function PostsPage() {
  const posts = await getPosts({ includeDrafts: true });
  return <PostsTable initialPosts={posts} />;
}
