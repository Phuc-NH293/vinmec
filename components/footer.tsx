import Link from "next/link";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <BrandLogo />
          <p>
            Kết nối tinh hoa, tận tâm chăm sóc. Đồng hành cùng sức khỏe của bạn
            và gia đình bằng dịch vụ y tế tiêu chuẩn quốc tế.
          </p>
          <div className="social-row">
            <span>
              <Facebook size={18} />
            </span>
            <span>
              <Mail size={18} />
            </span>
          </div>
        </div>
        <div>
          <h4>Khám phá</h4>
          <Link href="/#chuyen-khoa">Chuyên khoa</Link>
          <Link href="/#dich-vu">Dịch vụ y tế</Link>
          <Link href="/bac-si">Đội ngũ bác sĩ</Link>
          <Link href="/tin-tuc">Tin sức khỏe</Link>
          <Link href="/admin">Khu vực quản trị</Link>
        </div>
        <div>
          <h4>Hỗ trợ khách hàng</h4>
          <Link href="/dang-ky-kham">Đặt lịch khám</Link>
          <Link href="/">Hướng dẫn thăm khám</Link>
          <Link href="/">Chính sách bảo mật</Link>
          <Link href="/">Câu hỏi thường gặp</Link>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <p className="contact-line">
            <MapPin size={17} /> 458 Minh Khai, Hai Bà Trưng, Hà Nội
          </p>
          <p className="contact-line">
            <Phone size={17} /> 1900 232 389
          </p>
          <p className="contact-line">
            <Mail size={17} /> info@vinmec.com
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="site-container">
          © 2026 Vinmec. Nội dung chỉ mang tính chất tham khảo.
        </div>
      </div>
    </footer>
  );
}
