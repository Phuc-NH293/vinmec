"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RotateCcw,
  Send,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

const facilities = [
  "Bệnh viện ĐKQT Vinmec Times City",
  "Bệnh viện ĐKQT Vinmec Central Park",
  "Bệnh viện ĐKQT Vinmec Smart City",
  "Bệnh viện ĐKQT Vinmec Đà Nẵng",
  "Bệnh viện ĐKQT Vinmec Nha Trang",
  "Bệnh viện ĐKQT Vinmec Hải Phòng",
  "Phòng khám ĐKQT Vinmec Royal City",
];

const specialties = [
  "Hồi sức cấp cứu",
  "Tim mạch",
  "Sản phụ khoa",
  "Nhi khoa",
  "Dinh dưỡng",
  "Cơ xương khớp",
  "Tiêu hóa - Gan mật",
  "Thần kinh",
  "Ung bướu",
  "Khám sức khỏe tổng quát",
];

const doctors: Record<string, string[]> = {
  "Hồi sức cấp cứu": ["GS.TS.BS Nguyễn Gia Bình"],
  "Tim mạch": ["ThS.BS Lê Nhất Huy"],
  "Sản phụ khoa": ["BSCKII Trần Thị Minh", "ThS.BS Trần Thu Hà"],
  "Nhi khoa": ["BSCKII Phạm Lan Hương"],
  "Dinh dưỡng": ["PGS.TS.BS Nguyễn Thị Lâm"],
  "Cơ xương khớp": ["TS.BS Đỗ Quang Huy"],
};

const timeSlots = [
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "14:00 - 14:30",
  "14:30 - 15:00",
  "15:00 - 15:30",
];

function localDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function BookingForm({
  initialSpecialty = "",
  initialDoctor = "",
}: {
  initialSpecialty?: string;
  initialDoctor?: string;
}) {
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  const dates = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);
        return {
          value: localDate(date),
          day: date.toLocaleDateString("vi-VN", { weekday: "short" }),
          date: date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
        };
      }),
    [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const body = Object.fromEntries(data.entries());
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        accepted: data.get("accepted") === "on",
      }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setError(result.error || "Không thể gửi yêu cầu. Vui lòng thử lại.");
      return;
    }
    setBookingCode(result.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (bookingCode) {
    return (
      <section className="booking-success">
        <span className="booking-success-icon">
          <CheckCircle2 />
        </span>
        <span className="section-kicker">Đăng ký thành công</span>
        <h2>Vinmec đã tiếp nhận yêu cầu của bạn</h2>
        <p>
          Mã đăng ký: <strong>{bookingCode}</strong>. Tổng đài Vinmec sẽ gọi lại
          để xác nhận thời gian và bác sĩ trong thời gian sớm nhất.
        </p>
        <div className="booking-success-note">
          <Clock3 size={18} />
          Vui lòng giữ điện thoại trong trạng thái có thể liên lạc.
        </div>
        <button
          className="button button-primary"
          onClick={() => {
            setBookingCode("");
            setSelectedDate("");
            setSelectedTime("");
          }}
        >
          <RotateCcw size={17} /> Đăng ký lịch khác
        </button>
      </section>
    );
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <section className="booking-form-section">
        <div className="booking-section-heading">
          <span>01</span>
          <div>
            <h2>Nội dung chi tiết đặt hẹn</h2>
            <p>Chọn nơi khám, chuyên khoa và thời gian phù hợp.</p>
          </div>
        </div>

        <div className="booking-detail-grid">
          <div className="booking-fields">
            <label>
              Bệnh viện/phòng khám Vinmec <em>*</em>
              <select name="facility" required defaultValue="">
                <option value="" disabled>
                  Chọn cơ sở khám
                </option>
                {facilities.map((facility) => (
                  <option key={facility}>{facility}</option>
                ))}
              </select>
            </label>
            <label>
              Chuyên khoa <em>*</em>
              <select
                name="specialty"
                required
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
              >
                <option value="" disabled>
                  Chọn chuyên khoa
                </option>
                {specialties.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Bác sĩ
              <select name="doctor" defaultValue={initialDoctor}>
                <option value="">Chọn bác sĩ muốn khám</option>
                {(doctors[specialty] ?? []).map((doctor) => (
                  <option key={doctor}>{doctor}</option>
                ))}
              </select>
            </label>
            <label className="booking-checkbox">
              <input name="foreigner" type="checkbox" />
              <span>Đặt hẹn cho người nước ngoài</span>
            </label>
          </div>

          <div className="booking-schedule">
            <label className="booking-label">
              Ngày khám <em>*</em>
            </label>
            <div className="booking-date-list">
              {dates.map((item) => (
                <button
                  type="button"
                  className={selectedDate === item.value ? "selected" : ""}
                  onClick={() => {
                    setSelectedDate(item.value);
                    setSelectedTime("");
                  }}
                  key={item.value}
                >
                  <strong>{item.date}</strong>
                  <span>{item.day}</span>
                </button>
              ))}
            </div>
            <label className="booking-label">
              Khung giờ <em>*</em>
            </label>
            <div className="booking-time-list">
              {timeSlots.map((time) => (
                <button
                  type="button"
                  disabled={!selectedDate}
                  className={selectedTime === time ? "selected" : ""}
                  onClick={() => setSelectedTime(time)}
                  key={time}
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="booking-help">
              <Clock3 size={15} />
              Vinmec sẽ gọi lại để xác nhận lịch khám chính thức.
            </p>
          </div>
        </div>
      </section>

      <section className="booking-form-section">
        <div className="booking-section-heading">
          <span>02</span>
          <div>
            <h2>Thông tin khách hàng</h2>
            <p>Thông tin được bảo mật và chỉ dùng để xác nhận lịch khám.</p>
          </div>
        </div>

        <div className="patient-grid">
          <label>
            Họ và tên <em>*</em>
            <input name="fullName" required placeholder="Nhập họ và tên" />
          </label>
          <fieldset className="gender-field">
            <legend>
              Giới tính <em>*</em>
            </legend>
            <label>
              <input name="gender" type="radio" value="Nam" required /> Nam
            </label>
            <label>
              <input name="gender" type="radio" value="Nữ" required /> Nữ
            </label>
            <label>
              <input name="gender" type="radio" value="Khác" required /> Khác
            </label>
          </fieldset>
          <label>
            Ngày tháng năm sinh <em>*</em>
            <input name="dateOfBirth" required type="date" />
          </label>
          <label>
            Số điện thoại <em>*</em>
            <input
              name="phone"
              required
              type="tel"
              pattern="[0-9+\s]{8,15}"
              placeholder="Nhập số điện thoại"
            />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="Nhập email" />
          </label>
        </div>

        <label className="reason-field">
          Lý do khám <em>*</em>
          <textarea
            name="reason"
            required
            rows={5}
            placeholder="Mô tả triệu chứng hoặc nhu cầu thăm khám của bạn..."
          />
        </label>

        <label className="terms-field">
          <input name="accepted" type="checkbox" required />
          <span>
            Tôi đã đọc và đồng ý với{" "}
            <a href="#">chính sách bảo vệ dữ liệu cá nhân</a> và các điều khoản
            của Vinmec.
          </span>
        </label>

        {error && <div className="form-error">{error}</div>}
        <div className="booking-submit-row">
          <div>
            <ShieldCheck size={18} />
            Dữ liệu của bạn được bảo mật
          </div>
          <button
            className="button button-primary booking-submit"
            disabled={submitting || !selectedDate || !selectedTime}
          >
            {submitting ? (
              "Đang gửi..."
            ) : (
              <>
                Gửi thông tin <Send size={17} />
              </>
            )}
          </button>
        </div>
      </section>
    </form>
  );
}

export function BookingSteps() {
  return (
    <div className="booking-steps">
      <div className="active">
        <span>
          <Stethoscope />
        </span>
        <strong>Chọn dịch vụ</strong>
      </div>
      <ChevronRight />
      <div>
        <span>
          <CalendarDays />
        </span>
        <strong>Chọn lịch khám</strong>
      </div>
      <ChevronRight />
      <div>
        <span>
          <Check />
        </span>
        <strong>Xác nhận thông tin</strong>
      </div>
    </div>
  );
}
