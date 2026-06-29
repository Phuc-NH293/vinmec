import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tin sức khỏe",
  description: "Kiến thức sức khỏe được biên soạn bởi đội ngũ Vinmec.",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const allPosts = await getPosts();
  const categories = Array.from(new Set(allPosts.map((post) => post.category)));
  const posts = await getPosts({
    query: params.q,
    category: params.category,
  });

  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="site-container">
          <span className="section-kicker">Cẩm nang Vinmec</span>
          <h1>Kiến thức sức khỏe</h1>
          <p>
            Thông tin dễ hiểu, đáng tin cậy để bạn chủ động chăm sóc bản thân và
            gia đình mỗi ngày.
          </p>
        </div>
      </section>
      <section className="section news-list-section">
        <div className="site-container">
          <form className="news-toolbar">
            <label className="search-box">
              <Search size={19} />
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Tìm bài viết..."
              />
            </label>
            <div className="category-tabs">
              <Link
                className={!params.category ? "active" : ""}
                href={params.q ? `/tin-tuc?q=${params.q}` : "/tin-tuc"}
              >
                Tất cả
              </Link>
              {categories.map((category) => (
                <Link
                  className={params.category === category ? "active" : ""}
                  href={`/tin-tuc?category=${encodeURIComponent(category)}`}
                  key={category}
                >
                  {category}
                </Link>
              ))}
            </div>
          </form>
          {posts.length ? (
            <div className="article-grid">
              {posts.map((post) => (
                <ArticleCard post={post} key={post.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h3>Chưa tìm thấy bài viết</h3>
              <p>Hãy thử từ khóa hoặc chuyên mục khác.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
