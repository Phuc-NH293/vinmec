import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Baby,
  Bone,
  Brain,
  CalendarCheck,
  Check,
  HeartPulse,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { AppointmentForm } from "@/components/appointment-form";
import { getPosts } from "@/lib/posts";

const specialties = [
  {
    icon: HeartPulse,
    name: "Tim mạch",
    desc: "Tầm soát, chẩn đoán và điều trị chuyên sâu.",
    color: "coral",
  },
  {
    icon: Baby,
    name: "Sản - Nhi",
    desc: "Đồng hành từ thai kỳ đến những năm đầu đời.",
    color: "peach",
  },
  {
    icon: Bone,
    name: "Cơ xương khớp",
    desc: "Khôi phục vận động, nâng cao chất lượng sống.",
    color: "blue",
  },
  {
    icon: Brain,
    name: "Thần kinh",
    desc: "Tiếp cận đa chuyên khoa và công nghệ hiện đại.",
    color: "violet",
  },
  {
    icon: Microscope,
    name: "Ung bướu",
    desc: "Phác đồ cá thể hóa, chăm sóc toàn diện.",
    color: "green",
  },
  {
    icon: Activity,
    name: "Khám tổng quát",
    desc: "Chủ động phát hiện sớm các nguy cơ sức khỏe.",
    color: "cyan",
  },
];

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3);

  return (
    <main>
      <Header />
      <section className="hero">
        <Image
          src="/assets/images/banners/banner_main.jpg"
          alt=""
          fill
          priority
          className="hero-background"
        />
        <div className="hero-overlay" />
        <div className="site-container hero-content">
          <span className="eyebrow">
            <Sparkles size={16} /> Hệ thống Y tế Quốc tế Vinmec
          </span>
          <h1>
            Chăm sóc sức khỏe
            <br />
            <em>bằng sự thấu cảm.</em>
          </h1>
          <p>
            Kết nối đội ngũ chuyên gia hàng đầu, công nghệ hiện đại và dịch vụ
            tận tâm trong một hệ sinh thái chăm sóc sức khỏe toàn diện.
          </p>
          <div className="hero-actions">
            <Link href="/dang-ky-kham" className="button button-primary">
              <CalendarCheck size={19} /> Đặt lịch khám
            </Link>
            <Link href="#chuyen-khoa" className="button button-glass">
              Khám phá dịch vụ <ArrowRight size={18} />
            </Link>
          </div>
          <div className="trust-row">
            <span>
              <strong>13+</strong> năm phát triển
            </span>
            <span>
              <strong>1.500+</strong> chuyên gia
            </span>
            <span>
              <strong>10</strong> bệnh viện & phòng khám
            </span>
          </div>
        </div>
      </section>

      <section className="quick-services">
        <div className="site-container quick-grid">
          <Link href="/dang-ky-kham" className="quick-service-link">
            <span className="quick-icon">
              <CalendarCheck />
            </span>
            <div>
              <strong>Đặt lịch trực tuyến</strong>
              <small>Chủ động chọn thời gian</small>
            </div>
            <span className="quick-link-arrow"><ArrowRight /></span>
          </Link>
          <Link href="/bac-si" className="quick-service-link">
            <span className="quick-icon">
              <Stethoscope />
            </span>
            <div>
              <strong>Tìm bác sĩ</strong>
              <small>Chuyên gia phù hợp với bạn</small>
            </div>
            <span className="quick-link-arrow"><ArrowRight /></span>
          </Link>
          <Link href="/dang-ky-kham" className="quick-service-link">
            <span className="quick-icon">
              <ShieldCheck />
            </span>
            <div>
              <strong>Gói khám sức khỏe</strong>
              <small>Thiết kế theo từng nhu cầu</small>
            </div>
            <span className="quick-link-arrow"><ArrowRight /></span>
          </Link>
        </div>
      </section>

      <section className="section" id="chuyen-khoa">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Chăm sóc chuyên sâu</span>
              <h2>Chuyên khoa nổi bật</h2>
            </div>
            <p>
              Hệ thống chuyên khoa toàn diện, phối hợp liên chuyên khoa và cá
              thể hóa kế hoạch điều trị cho từng khách hàng.
            </p>
          </div>
          <div className="specialty-grid">
            {specialties.map(({ icon: Icon, name, desc, color }) => (
              <Link href="/dang-ky-kham" className="specialty-card" key={name}>
                <span className={`specialty-icon ${color}`}>
                  <Icon />
                </span>
                <h3>{name}</h3>
                <p>{desc}</p>
                <span className="card-arrow">
                  <ArrowRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section why-section" id="ve-chung-toi">
        <div className="site-container why-grid">
          <div className="why-image-wrap">
            <Image
              src="/assets/images/why_us_doctor.jpg"
              alt="Đội ngũ bác sĩ Vinmec"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className="experience-badge">
              <strong>15+</strong>
              <span>Năm tận tâm<br />vì sức khỏe</span>
            </div>
          </div>
          <div className="why-content">
            <span className="section-kicker">Vì sao chọn Vinmec</span>
            <h2>Tiêu chuẩn quốc tế.<br />Tận tâm trong từng trải nghiệm.</h2>
            <p>
              Vinmec xây dựng mô hình bệnh viện hàn lâm, kết hợp điều trị,
              nghiên cứu và đào tạo để mang đến chất lượng chăm sóc đồng nhất.
            </p>
            <ul className="check-list">
              <li>
                <Check /> Đội ngũ chuyên gia giàu kinh nghiệm
              </li>
              <li>
                <Check /> Cơ sở vật chất và công nghệ y khoa hiện đại
              </li>
              <li>
                <Check /> Quy trình quản lý chất lượng theo chuẩn quốc tế
              </li>
              <li>
                <Check /> Chăm sóc toàn diện, lấy người bệnh làm trung tâm
              </li>
            </ul>
            <Link href="#dat-lich" className="text-link">
              Tìm hiểu về Vinmec <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section news-section">
        <div className="site-container">
          <div className="section-heading align-end">
            <div>
              <span className="section-kicker">Kiến thức hữu ích</span>
              <h2>Sống khỏe mỗi ngày</h2>
            </div>
            <Link href="/tin-tuc" className="button button-outline">
              Xem tất cả bài viết <ArrowRight size={17} />
            </Link>
          </div>
          <div className="article-grid">
            {posts.map((post) => (
              <ArticleCard post={post} key={post.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="appointment-section" id="dat-lich">
        <div className="site-container appointment-grid">
          <div className="appointment-copy">
            <span className="eyebrow light">Dễ dàng & nhanh chóng</span>
            <h2>Đặt lịch khám cùng chuyên gia</h2>
            <p>
              Để lại thông tin, đội ngũ chăm sóc khách hàng sẽ liên hệ xác nhận
              và hỗ trợ bạn chọn bác sĩ phù hợp.
            </p>
            <div className="hotline-card">
              <span>Hotline tư vấn 24/7</span>
              <strong>1900 232 389</strong>
            </div>
          </div>
          <AppointmentForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
