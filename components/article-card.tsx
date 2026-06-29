import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDate, readingTime } from "@/lib/utils";

export function ArticleCard({
  post,
  large = false,
}: {
  post: Post;
  large?: boolean;
}) {
  return (
    <article className={`article-card ${large ? "article-card-large" : ""}`}>
      <Link href={`/tin-tuc/${post.slug}`} className="article-image">
        <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 520px" />
        <span className="category-pill">{post.category}</span>
      </Link>
      <div className="article-body">
        <div className="article-meta">
          <span>{formatDate(post.publishedAt)}</span>
          <span>
            <Clock3 size={14} /> {readingTime(post.content)} phút đọc
          </span>
        </div>
        <h3>
          <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.excerpt}</p>
        <Link href={`/tin-tuc/${post.slug}`} className="text-link">
          Đọc bài viết <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
