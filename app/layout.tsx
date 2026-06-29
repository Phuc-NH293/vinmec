import type { Metadata } from "next";
import { Be_Vietnam_Pro, Manrope } from "next/font/google";
import { AiChatWidget } from "@/components/ai-chat-widget";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "Vinmec | Hệ thống Y tế Quốc tế",
    template: "%s | Vinmec",
  },
  description:
    "Hệ thống Y tế Quốc tế Vinmec cung cấp dịch vụ khám chữa bệnh, chăm sóc sức khỏe và thông tin y khoa đáng tin cậy.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} ${manrope.variable}`}>
        {children}
        <AiChatWidget />
      </body>
    </html>
  );
}
