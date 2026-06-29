import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Trang bạn tìm không tồn tại</h1>
      <p>Nội dung có thể đã được di chuyển hoặc chưa được xuất bản.</p>
      <Link href="/" className="button button-primary">
        Về trang chủ
      </Link>
    </main>
  );
}
