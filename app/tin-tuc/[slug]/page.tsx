import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Share2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArticleContent } from "@/components/article-content";
import { ArticleCard } from "@/components/article-card";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { formatDate, readingTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return post
    ? { title: post.title, description: post.excerpt }
    : { title: "Không tìm thấy bài viết" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = (await getPosts())
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  return (
    <main>
      <Header />
      <article>
        <div className="site-container article-header">
          <Link href="/tin-tuc" className="back-link">
            <ArrowLeft size={17} /> Quay lại tin sức khỏe
          </Link>
          <span className="category-pill static">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="article-lead">{post.excerpt}</p>
          <div className="article-byline">
            <div>
              <strong>{post.author}</strong>
              <span>
                {formatDate(post.publishedAt)} ·{" "}
                <Clock3 size={14} /> {readingTime(post.content)} phút đọc
              </span>
            </div>
            <button className="icon-button" aria-label="Chia sẻ">
              <Share2 size={18} />
            </button>
          </div>
        </div>
        <div className="site-container article-cover">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1000px) 100vw, 1100px"
          />
        </div>
        <div className="site-container article-layout">
          <ArticleContent content={post.content} />
          <aside className="article-aside">
            <strong>Lưu ý y khoa</strong>
            <p>
              Nội dung chỉ nhằm cung cấp thông tin, không thay thế việc thăm khám
              và chẩn đoán trực tiếp từ bác sĩ.
            </p>
            <Link href="/dang-ky-kham" className="button button-primary">
              Đặt lịch tư vấn
            </Link>
          </aside>
        </div>
      </article>
      <section className="section related-section">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Có thể bạn quan tâm</span>
              <h2>Bài viết liên quan</h2>
            </div>
          </div>
          <div className="article-grid">
            {related.map((item) => (
              <ArticleCard post={item} key={item.id} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
