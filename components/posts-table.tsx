"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PostsTable({ initialPosts }: { initialPosts: Post[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      posts.filter(
        (post) =>
          (status === "all" || post.status === status) &&
          post.title.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
      ),
    [posts, query, status],
  );

  async function remove(post: Post) {
    if (!window.confirm(`Xóa bài viết “${post.title}”?`)) return;
    const response = await fetch(`/api/admin/posts/${post.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setPosts((items) => items.filter((item) => item.id !== post.id));
      router.refresh();
    }
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="admin-kicker">Thư viện nội dung</span>
          <h1>Quản lý bài viết</h1>
          <p>Tạo, chỉnh sửa và kiểm soát nội dung hiển thị trên website.</p>
        </div>
        <Link href="/admin/posts/new" className="button button-primary">
          <Plus size={18} /> Tạo bài mới
        </Link>
      </div>
      <section className="admin-card posts-card">
        <div className="table-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              placeholder="Tìm theo tiêu đề..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        <div className="table-scroll">
          <table className="posts-table">
            <thead>
              <tr>
                <th>Bài viết</th>
                <th>Chuyên mục</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="table-post-title">
                      <Image
                        src={post.image}
                        alt=""
                        width={78}
                        height={52}
                      />
                      <div>
                        <strong>{post.title}</strong>
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </td>
                  <td>{post.category}</td>
                  <td>
                    <span className={`status-badge ${post.status}`}>
                      {post.status === "published" ? "Đã đăng" : "Bản nháp"}
                    </span>
                  </td>
                  <td>{formatDate(post.updatedAt)}</td>
                  <td>
                    <div className="row-actions">
                      {post.status === "published" && (
                        <Link
                          href={`/tin-tuc/${post.slug}`}
                          target="_blank"
                          title="Xem bài"
                        >
                          <Eye size={17} />
                        </Link>
                      )}
                      <Link href={`/admin/posts/${post.id}/edit`} title="Sửa">
                        <Edit3 size={17} />
                      </Link>
                      <button onClick={() => remove(post)} title="Xóa">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="empty-state compact">
            <Search size={28} />
            <h3>Không có bài viết phù hợp</h3>
          </div>
        )}
      </section>
    </>
  );
}
