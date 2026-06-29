"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function AppointmentForm() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="appointment-success">
        <CheckCircle2 size={42} />
        <h3>Đã tiếp nhận yêu cầu</h3>
        <p>Chuyên viên Vinmec sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
        <button className="button button-soft" onClick={() => setSent(false)}>
          Tạo yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form className="appointment-form" onSubmit={submit}>
      <div className="field-grid">
        <label>
          Họ và tên
          <input required placeholder="Nguyễn Văn A" />
        </label>
        <label>
          Số điện thoại
          <input required type="tel" placeholder="09xx xxx xxx" />
        </label>
      </div>
      <label>
        Chuyên khoa cần khám
        <select defaultValue="">
          <option value="" disabled>
            Chọn chuyên khoa
          </option>
          <option>Tim mạch</option>
          <option>Sản - Nhi</option>
          <option>Cơ xương khớp</option>
          <option>Khám tổng quát</option>
        </select>
      </label>
      <label>
        Ghi chú
        <textarea rows={3} placeholder="Mô tả ngắn nhu cầu của bạn..." />
      </label>
      <button className="button button-white" type="submit">
        Gửi yêu cầu đặt lịch
      </button>
      <small>Bằng việc gửi thông tin, bạn đồng ý với chính sách bảo mật.</small>
    </form>
  );
}
