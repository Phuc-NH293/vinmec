"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PlusCircle,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Bài viết", icon: FileText },
  { href: "/admin/posts/new", label: "Tạo bài mới", icon: PlusCircle },
  { href: "/admin/ai", label: "AI Knowledge", icon: Sparkles },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <>
      <div className="admin-logo-row">
        <BrandLogo />
        <button onClick={() => setMobileOpen(false)}>
          <PanelLeftClose size={20} />
        </button>
      </div>
      <nav className="admin-nav">
        <span>Nội dung</span>
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              href={href}
              className={active ? "active" : ""}
              key={href}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} /> {label}
            </Link>
          );
        })}
        <span>Hệ thống</span>
        <button className="coming-soon">
          <Settings size={19} /> Cài đặt
        </button>
      </nav>
      <div className="admin-sidebar-footer">
        <div className="admin-avatar">A</div>
        <div>
          <strong>Quản trị viên</strong>
          <span>{email}</span>
        </div>
        <button onClick={logout} aria-label="Đăng xuất">
          <LogOut size={18} />
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">{sidebar}</aside>
      {mobileOpen && (
        <div className="admin-mobile-overlay">
          <aside className="admin-sidebar mobile">
            <button
              className="admin-mobile-close"
              onClick={() => setMobileOpen(false)}
            >
              <X />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-button"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </button>
          <Link href="/" target="_blank" className="view-site-link">
            <ChevronLeft size={16} /> Xem website
          </Link>
          <div className="admin-topbar-actions">
            <span className="status-dot" /> Hệ thống hoạt động
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
