import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  PenLine,
  Plus,
  Sparkles,
} from "lucide-react";
import { getPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const posts = await getPosts({ includeDrafts: true });
  const published = posts.filter((post) => post.status === "published");
  const drafts = posts.filter((post) => post.status === "draft");

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="admin-kicker">Thứ hai, 22 tháng 6</span>
          <h1>Chào buổi tối, Admin 👋</h1>
          <p>Đây là tình hình nội dung của Vinmec hôm nay.</p>
        </div>
        <Link href="/admin/posts/new" className="button button-primary">
          <Plus size={18} /> Viết bài mới
        </Link>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon blue">
            <FileText />
          </span>
          <div>
            <small>Tổng bài viết</small>
            <strong>{posts.length}</strong>
            <span>Trong thư viện nội dung</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon green">
            <CheckCircle2 />
          </span>
          <div>
            <small>Đã xuất bản</small>
            <strong>{published.length}</strong>
            <span>Đang hiển thị trên website</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon orange">
            <Clock3 />
          </span>
          <div>
            <small>Bản nháp</small>
            <strong>{drafts.length}</strong>
            <span>Đang chờ hoàn thiện</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon violet">
            <Eye />
          </span>
          <div>
            <small>Lượt xem tháng</small>
            <strong>24.8K</strong>
            <span className="positive">↑ 12,5% so với tháng trước</span>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="admin-card recent-card">
          <div className="admin-card-header">
            <div>
              <h2>Bài viết gần đây</h2>
              <p>Nội dung vừa được cập nhật</p>
            </div>
            <Link href="/admin/posts">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>
          <div className="recent-post-list">
            {posts.slice(0, 5).map((post) => (
              <div className="recent-post" key={post.id}>
                <span className="post-file-icon">
                  <PenLine size={18} />
                </span>
                <div>
                  <strong>{post.title}</strong>
                  <span>
                    {post.category} · Cập nhật {formatDate(post.updatedAt)}
                  </span>
                </div>
                <span className={`status-badge ${post.status}`}>
                  {post.status === "published" ? "Đã đăng" : "Bản nháp"}
                </span>
              </div>
            ))}
          </div>
        </section>
        <aside className="admin-card ai-card">
          <span className="ai-glow">
            <Sparkles />
          </span>
          <span className="admin-kicker">Sẵn sàng cho bước tiếp theo</span>
          <h2>AI Content Studio</h2>
          <p>
            Kiến trúc đã chuẩn bị để hỗ trợ lên ý tưởng, tạo dàn ý và biên tập
            bài viết bằng AI.
          </p>
          <ul>
            <li>
              <CheckCircle2 size={16} /> Tạo bản nháp từ chủ đề
            </li>
            <li>
              <CheckCircle2 size={16} /> Gợi ý tiêu đề & mô tả SEO
            </li>
            <li>
              <CheckCircle2 size={16} /> Kiểm tra giọng văn y khoa
            </li>
          </ul>
          <button className="button button-dark" disabled>
            Kết nối AI sau
          </button>
        </aside>
      </div>
    </>
  );
}
