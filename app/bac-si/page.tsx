import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { DoctorDirectory } from "@/components/doctor-directory";

export const metadata: Metadata = {
  title: "Đội ngũ bác sĩ",
  description:
    "Tìm kiếm đội ngũ bác sĩ và chuyên gia tại hệ thống Y tế Quốc tế Vinmec.",
};

export default function DoctorsPage() {
  return (
    <main>
      <Header />
      <section className="doctor-hero">
        <Image
          src="/assets/images/why_us_doctor.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="doctor-hero-overlay" />
        <div className="site-container doctor-hero-content">
          <span className="eyebrow light">Chuyên gia Vinmec</span>
          <h1>Tìm bác sĩ phù hợp với bạn</h1>
          <p>
            Tra cứu theo tên, chuyên khoa hoặc cơ sở và chủ động đăng ký lịch
            khám với chuyên gia.
          </p>
        </div>
      </section>
      <section className="doctor-directory-section">
        <div className="site-container">
          <DoctorDirectory />
        </div>
      </section>
      <Footer />
    </main>
  );
}
