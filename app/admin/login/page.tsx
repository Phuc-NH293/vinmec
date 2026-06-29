"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("Email hoặc mật khẩu chưa đúng.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="login-page">
      <div className="login-visual">
        <BrandLogo />
        <div>
          <span className="eyebrow light">Vinmec CMS</span>
          <h1>Nội dung tốt tạo nên niềm tin.</h1>
          <p>
            Quản lý thư viện kiến thức sức khỏe và sẵn sàng tăng tốc với AI.
          </p>
        </div>
        <small>© 2026 Vinmec</small>
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={login}>
          <div className="mobile-login-logo">
            <BrandLogo />
          </div>
          <span className="admin-kicker">Khu vực quản trị</span>
          <h2>Chào mừng trở lại</h2>
          <p>Đăng nhập để quản lý nội dung website.</p>
          <label>
            Email
            <span className="input-with-icon">
              <Mail size={18} />
              <input
                name="email"
                type="email"
                required
                defaultValue="admin@vinmec.vn"
              />
            </span>
          </label>
          <label>
            Mật khẩu
            <span className="input-with-icon">
              <LockKeyhole size={18} />
              <input
                name="password"
                type="password"
                required
                defaultValue="admin123"
              />
            </span>
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="button button-primary" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            {!loading && <ArrowRight size={17} />}
          </button>
          <small className="demo-hint">
            Tài khoản demo đã được điền sẵn. Hãy đổi trong biến môi trường khi
            triển khai.
          </small>
        </form>
      </div>
    </main>
  );
}
