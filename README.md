# Vinmec Health Platform

Website y tế xây bằng Next.js App Router, gồm giao diện khách hàng và hệ thống
quản trị nội dung.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Khu vực quản trị

- URL: `/admin`
- Email mặc định: `admin@vinmec.vn`
- Mật khẩu mặc định: `admin123`

Sao chép `.env.example` thành `.env.local` và đổi thông tin đăng nhập cùng
`AUTH_SECRET` trước khi triển khai.

## Dữ liệu và AI

Bản demo lưu bài viết tại `data/posts.json` thông qua lớp `lib/posts.ts`. Khi
triển khai production, có thể thay lớp này bằng PostgreSQL, Supabase hoặc một
CMS mà không cần thay đổi giao diện.

Điểm tích hợp tạo bài nằm tại `lib/ai.ts` và `/api/ai/draft`, sử dụng chung
Gemini API key với chatbot.

## Gemini AI Knowledge Studio

Mở `/admin/ai` để:

- cấu hình model Gemini;
- chọn chế độ dùng tài liệu, Gemini hoặc kết hợp;
- tải PDF, DOCX, TXT và Markdown làm kho tri thức;
- quản lý tài liệu đã trích xuất.

Widget chat gọi `/api/ai/chat`. API key được đọc từ biến môi trường:

```env
GEMINI_API_KEY=your-gemini-api-key
```

Model mặc định là `gemini-2.5-flash`. Gemini nhận câu hỏi, lịch sử chat
và các đoạn tài liệu được truy xuất từ kho PDF/DOCX/TXT/Markdown.

Chat API có lớp kiểm soát phạm vi phía server. Câu hỏi ngoài lĩnh vực y tế và
dịch vụ Vinmec bị từ chối trước khi truy xuất tài liệu hoặc gọi Gemini.

Luồng chat được điều phối bằng LangGraph: phân loại ý định trước, sau đó rẽ sang
nhánh chào hỏi, từ chối ngoài phạm vi, hoặc truy xuất kho tri thức và tạo câu trả
lời. Lời chào được phản hồi trực tiếp nên không bị Gemini hiểu nhầm là câu hỏi
ngoài lĩnh vực y tế.
