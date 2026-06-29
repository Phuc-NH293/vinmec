"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Menu,
  Phone,
  Search,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const nav = [
  { label: "Chuyên khoa", href: "/#chuyen-khoa" },
  { label: "Dịch vụ", href: "/#dich-vu" },
  { label: "Đội ngũ bác sĩ", href: "/bac-si" },
  { label: "Tin sức khỏe", href: "/tin-tuc" },
  { label: "Về chúng tôi", href: "/#ve-chung-toi" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="top-strip">
        <div className="site-container top-strip-inner">
          <span>
            <Phone size={14} /> Hotline: <strong>1900 232 389</strong>
          </span>
          <span>Hệ thống y tế tiêu chuẩn quốc tế</span>
        </div>
      </div>
      <header className="site-header">
        <div className="site-container header-inner">
          <BrandLogo />
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {nav.map((item, index) => (
              <Link href={item.href} key={item.href}>
                {item.label}
                {index < 2 && <ChevronDown size={14} />}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button className="icon-button" aria-label="Tìm kiếm">
              <Search size={19} />
            </button>
            <Link href="/dang-ky-kham" className="button button-primary header-cta">
              <CalendarDays size={18} />
              Đặt lịch khám
            </Link>
            <button
              className="mobile-toggle"
              onClick={() => setOpen((value) => !value)}
              aria-label="Mở menu"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav">
            {nav.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/dang-ky-kham" onClick={() => setOpen(false)}>
              Đặt lịch khám
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
