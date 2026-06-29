"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Eye,
  ImageIcon,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { FormEvent, useState } from "react";
import type { Post, PostInput, PostStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

const sampleImages = [
  "/assets/images/banners/banner_main.jpg",
  "/assets/images/banners/banner_cardiology.jpg",
  "/assets/images/banners/banner_maternity.jpg",
  "/assets/images/clinics/clinic_times_city.jpg",
];

const emptyPost: PostInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Sống khỏe",
  image: sampleImages[0],
  author: "Ban biên tập Vinmec",
  status: "draft",
  featured: false,
};

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [form, setForm] = useState<PostInput>(post ?? emptyPost);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  function update<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intendedStatus =
      (submitter?.value as PostStatus | undefined) ?? form.status;
    setSaving(true);
    setMessage("");
    const payload = { ...form, status: intendedStatus };
    const response = await fetch(
      post ? `/api/admin/posts/${post.id}` : "/api/admin/posts",
      {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Không thể lưu bài viết.");
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <>
      <form
        className="editor-page"
        onSubmit={(event) => submit(event)}
      >
        <div className="editor-header">
          <div>
            <button
              type="button"
              className="back-link"
              onClick={() => router.push("/admin/posts")}
            >
              <ArrowLeft size={16} /> Quay lại danh sách
            </button>
            <h1>{post ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h1>
            <p>
              {post
                ? "Cập nhật nội dung và trạng thái xuất bản."
                : "Soạn nội dung sức khỏe mới cho website."}
            </p>
          </div>
          <div className="editor-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setPreview(true)}
            >
              <Eye size={17} /> Xem trước
            </button>
            <button
              type="submit"
              name="status"
              value="draft"
              className="button button-soft"
              disabled={saving}
            >
              <Save size={17} /> Lưu nháp
            </button>
            <button
              type="submit"
              name="status"
              value="published"
              className="button button-primary"
              disabled={saving}
            >
              <Send size={17} /> Xuất bản
            </button>
          </div>
        </div>
        {message && <div className="form-error">{message}</div>}
        <div className="editor-layout">
          <div className="editor-main">
            <section className="admin-card editor-card">
              <div className="editor-card-title">
                <span>01</span>
                <div>
                  <h2>Nội dung chính</h2>
                  <p>Tiêu đề, mô tả và nội dung bài viết.</p>
                </div>
                <button
                  type="button"
                  className="ai-assist-button"
                  onClick={() => setAiOpen(true)}
                >
                  <Sparkles size={16} /> Viết cùng AI
                </button>
              </div>
              <label>
                Tiêu đề bài viết <em>*</em>
                <input
                  required
                  value={form.title}
                  onChange={(event) => {
                    update("title", event.target.value);
                    if (!post) update("slug", slugify(event.target.value));
                  }}
                  placeholder="Nhập tiêu đề rõ ràng, hấp dẫn..."
                />
              </label>
              <label>
                Đường dẫn
                <div className="slug-input">
                  <span>/tin-tuc/</span>
                  <input
                    required
                    value={form.slug}
                    onChange={(event) => update("slug", slugify(event.target.value))}
                  />
                </div>
              </label>
              <label>
                Mô tả ngắn <em>*</em>
                <textarea
                  required
                  rows={3}
                  maxLength={220}
                  value={form.excerpt}
                  onChange={(event) => update("excerpt", event.target.value)}
                  placeholder="Tóm tắt nội dung bài viết trong 1-2 câu..."
                />
                <small className="character-count">
                  {form.excerpt.length}/220
                </small>
              </label>
              <label>
                Nội dung bài viết <em>*</em>
                <div className="editor-toolbar">
                  <strong>B</strong>
                  <em>I</em>
                  <span>H2</span>
                  <span>• Danh sách</span>
                  <span>Markdown đơn giản</span>
                </div>
                <textarea
                  className="content-textarea"
                  required
                  rows={18}
                  value={form.content}
                  onChange={(event) => update("content", event.target.value)}
                  placeholder={"Viết nội dung tại đây...\n\nDùng ## để tạo tiêu đề mục."}
                />
              </label>
            </section>
          </div>
          <aside className="editor-sidebar">
            <section className="admin-card editor-card">
              <div className="editor-card-title compact-title">
                <span>02</span>
                <div>
                  <h2>Phân loại</h2>
                </div>
              </div>
              <label>
                Chuyên mục
                <select
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                >
                  <option>Sống khỏe</option>
                  <option>Tim mạch</option>
                  <option>Sản - Nhi</option>
                  <option>Cơ xương khớp</option>
                  <option>Dinh dưỡng</option>
                  <option>Công nghệ y tế</option>
                </select>
              </label>
              <label>
                Tác giả
                <input
                  required
                  value={form.author}
                  onChange={(event) => update("author", event.target.value)}
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => update("featured", event.target.checked)}
                />
                <span>
                  <strong>Bài viết nổi bật</strong>
                  <small>Ưu tiên hiển thị trên trang chủ</small>
                </span>
              </label>
            </section>
            <section className="admin-card editor-card">
              <div className="editor-card-title compact-title">
                <span>03</span>
                <div>
                  <h2>Ảnh đại diện</h2>
                </div>
              </div>
              <div className="selected-image">
                {form.image ? (
                  <Image src={form.image} alt="" fill sizes="320px" />
                ) : (
                  <ImageIcon />
                )}
              </div>
              <label>
                Đường dẫn ảnh
                <input
                  value={form.image}
                  onChange={(event) => update("image", event.target.value)}
                />
              </label>
              <div className="sample-images">
                {sampleImages.map((image) => (
                  <button
                    type="button"
                    className={form.image === image ? "selected" : ""}
                    onClick={() => update("image", image)}
                    key={image}
                  >
                    <Image src={image} alt="" fill sizes="70px" />
                    {form.image === image && <Check size={14} />}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </form>
      {preview && (
        <div className="modal-overlay">
          <div className="preview-modal">
            <div className="modal-header">
              <div>
                <span className="admin-kicker">Xem trước bài viết</span>
                <strong>Giao diện mô phỏng</strong>
              </div>
              <button onClick={() => setPreview(false)}>Đóng</button>
            </div>
            <div className="preview-content">
              <span className="category-pill static">{form.category}</span>
              <h1>{form.title || "Tiêu đề bài viết"}</h1>
              <p className="article-lead">
                {form.excerpt || "Mô tả ngắn của bài viết sẽ xuất hiện tại đây."}
              </p>
              <div className="preview-image">
                <Image src={form.image} alt="" fill sizes="800px" />
              </div>
              {form.content.split("\n\n").map((block, index) =>
                block.startsWith("## ") ? (
                  <h2 key={index}>{block.slice(3)}</h2>
                ) : (
                  <p key={index}>{block}</p>
                ),
              )}
            </div>
          </div>
        </div>
      )}
      {aiOpen && (
        <div className="modal-overlay">
          <div className="ai-modal">
            <span className="ai-glow">
              <Sparkles />
            </span>
            <h2>AI Content Studio đã sẵn sàng để kết nối</h2>
            <p>
              Form biên tập và endpoint AI đã được tách riêng. Khi có API key,
              chúng ta sẽ bổ sung model để tạo dàn ý, mô tả và bản nháp ngay tại
              đây.
            </p>
            <div className="ai-ready-list">
              <span><Check size={16} /> Service AI độc lập</span>
              <span><Check size={16} /> API route bảo vệ bởi đăng nhập</span>
              <span><Check size={16} /> UI trợ lý ngay trong editor</span>
            </div>
            <button
              className="button button-primary"
              onClick={() => setAiOpen(false)}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
