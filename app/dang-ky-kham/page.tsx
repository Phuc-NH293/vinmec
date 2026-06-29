import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Headphones, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BookingForm, BookingSteps } from "@/components/booking-form";
import { doctors } from "@/lib/doctors";

export const metadata: Metadata = {
  title: "Đăng ký khám",
  description:
    "Đăng ký lịch khám tại hệ thống Bệnh viện và Phòng khám Quốc tế Vinmec.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string; specialty?: string }>;
}) {
  const params = await searchParams;
  const selectedDoctor = doctors.find((doctor) => doctor.id === params.doctor);
  const initialSpecialty = selectedDoctor?.specialty || params.specialty || "";
  const initialDoctor = selectedDoctor
    ? `${selectedDoctor.title} ${selectedDoctor.name}`
    : "";

  return (
    <main className="booking-page">
      <Header />
      <section className="booking-hero">
        <Image
          src="/assets/images/banners/banner_main.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="booking-hero-overlay" />
        <div className="site-container booking-hero-content">
          <span className="eyebrow light">Dịch vụ trực tuyến</span>
          <h1>Đăng ký khám</h1>
          <p>
            Chủ động lựa chọn cơ sở, chuyên khoa và thời gian thăm khám phù hợp.
          </p>
        </div>
      </section>

      <div className="booking-quick-actions">
        <Link href="tel:1900232389">
          <Headphones />
          <span>
            <small>Cần hỗ trợ?</small>
            <strong>Gọi tổng đài</strong>
          </span>
        </Link>
        <Link href="/dang-ky-kham" className="active">
          <CalendarCheck />
          <span>
            <small>Đặt hẹn trực tuyến</small>
            <strong>Đặt lịch khám</strong>
          </span>
        </Link>
        <Link href="/bac-si">
          <Search />
          <span>
            <small>Tra cứu chuyên gia</small>
            <strong>Tìm bác sĩ</strong>
          </span>
        </Link>
      </div>

      <section className="booking-body">
        <div className="site-container booking-container">
          <nav className="booking-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            Đăng ký khám
          </nav>
          <BookingSteps />
          <BookingForm
            initialSpecialty={initialSpecialty}
            initialDoctor={initialDoctor}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
