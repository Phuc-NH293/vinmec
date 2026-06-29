"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Hospital,
  Loader2,
  LocateFixed,
  MapPin,
  MessageCircle,
  Minimize2,
  Navigation,
  PhoneCall,
  Send,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

type HospitalLocation = {
  name: string;
  facility: string;
  label: string;
  address: string;
  lat: number;
  lon: number;
};

type NearestHospital = HospitalLocation & {
  distanceKm: number;
};

type ChatAction =
  | { type: "emergency" }
  | { type: "booking" }
  | {
      type: "nearby";
      status: "idle" | "loading" | "ready" | "error";
      hospital?: NearestHospital;
      error?: string;
    };

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
  confidence?: number;
  confidenceLabel?: string;
  confidenceReason?: string;
  followUpQuestion?: string;
  action?: ChatAction;
};

const quickQuestions = [
  "Tôi muốn đặt lịch khám",
  "Tôi muốn đi khám ở bệnh viện gần nhất",
  "Đau ngực khó thở phải làm gì?",
];

const hospitalLocations: HospitalLocation[] = [
  {
    name: "Times City",
    facility: "Bệnh viện ĐKQT Vinmec Times City",
    label: "Vinmec Times City (Hà Nội)",
    address: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
    lat: 20.9964,
    lon: 105.8669,
  },
  {
    name: "Central Park",
    facility: "Bệnh viện ĐKQT Vinmec Central Park",
    label: "Vinmec Central Park (TP. HCM)",
    address: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP. HCM",
    lat: 10.7948,
    lon: 106.7203,
  },
  {
    name: "Smart City",
    facility: "Bệnh viện ĐKQT Vinmec Smart City",
    label: "Vinmec Smart City (Hà Nội)",
    address: "Vinhomes Smart City, Nam Từ Liêm, Hà Nội",
    lat: 21.0077,
    lon: 105.7473,
  },
  {
    name: "Da Nang",
    facility: "Bệnh viện ĐKQT Vinmec Đà Nẵng",
    label: "Vinmec Đà Nẵng",
    address: "30 Tháng 4, Hải Châu, Đà Nẵng",
    lat: 16.0391,
    lon: 108.2112,
  },
  {
    name: "Nha Trang",
    facility: "Bệnh viện ĐKQT Vinmec Nha Trang",
    label: "Vinmec Nha Trang",
    address: "42A Trần Phú, Nha Trang, Khánh Hòa",
    lat: 12.2129,
    lon: 109.2107,
  },
  {
    name: "Hai Phong",
    facility: "Bệnh viện ĐKQT Vinmec Hải Phòng",
    label: "Vinmec Hải Phòng",
    address: "Vinhomes Imperia, Hồng Bàng, Hải Phòng",
    lat: 20.8234,
    lon: 106.6879,
  },
  {
    name: "Royal City",
    facility: "Phòng khám ĐKQT Vinmec Royal City",
    label: "Vinmec Royal City (Hà Nội)",
    address: "72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
    lat: 21.0029,
    lon: 105.8156,
  },
];

const bookingSpecialties = [
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

const bookingTimes = [
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
  "09:30 - 10:00",
  "14:00 - 14:30",
  "14:30 - 15:00",
  "15:00 - 15:30",
];

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function detectAction(message: string): ChatAction["type"] | null {
  const normalized = normalizeText(message);
  const emergencyPatterns = [
    "cap cuu",
    "goi 115",
    "kho tho",
    "ngat",
    "hon me",
    "mat y thuc",
    "dau nguc",
    "dau that nguc",
    "dot quy",
    "meo mieng",
    "yeu liet",
    "co giat",
    "soc phan ve",
    "chay mau khong cam",
    "tu tu",
  ];
  if (emergencyPatterns.some((item) => normalized.includes(item))) {
    return "emergency";
  }

  const nearbyPatterns = [
    "muon di kham",
    "di kham o dau",
    "benh vien gan",
    "co so gan",
    "gan nhat",
    "gan toi",
    "lay vi tri",
    "vi tri hien tai",
  ];
  if (nearbyPatterns.some((item) => normalized.includes(item))) {
    return "nearby";
  }

  const bookingPatterns = [
    "dat lich",
    "dang ky kham",
    "hen kham",
    "lich kham",
    "dat hen",
  ];
  if (bookingPatterns.some((item) => normalized.includes(item))) {
    return "booking";
  }

  return null;
}

function distanceInKm(
  first: { lat: number; lon: number },
  second: { lat: number; lon: number },
) {
  const radius = 6371;
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const dLat = toRadians(second.lat - first.lat);
  const dLon = toRadians(second.lon - first.lon);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestHospital(lat: number, lon: number) {
  return hospitalLocations.reduce<NearestHospital | null>((nearest, item) => {
    const distanceKm = distanceInKm({ lat, lon }, item);
    if (!nearest || distanceKm < nearest.distanceKm) {
      return { ...item, distanceKm };
    }
    return nearest;
  }, null);
}

function localDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function nextBookingDates() {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return localDate(date);
  });
}

function createAssistantMessage(content: string, action?: ChatAction): Message {
  return {
    id: Date.now() + 1 + Math.floor(Math.random() * 1000),
    role: "assistant",
    content,
    action,
  };
}

function BookingActionForm({
  defaultFacility,
}: {
  defaultFacility?: string;
}) {
  const dates = useMemo(() => nextBookingDates(), []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facility: data.get("facility"),
        specialty: data.get("specialty"),
        appointmentDate: data.get("appointmentDate"),
        appointmentTime: data.get("appointmentTime"),
        fullName: data.get("fullName"),
        gender: data.get("gender"),
        dateOfBirth: data.get("dateOfBirth"),
        phone: data.get("phone"),
        reason: data.get("reason"),
        doctor: "",
        email: "",
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
  }

  if (bookingCode) {
    return (
      <div className="ai-action-card ai-booking-success">
        <CheckCircle2 size={18} />
        <strong>Đã tiếp nhận yêu cầu</strong>
        <span>Mã đăng ký: {bookingCode}</span>
      </div>
    );
  }

  return (
    <form className="ai-booking-form" onSubmit={submit}>
      <div className="ai-action-heading">
        <ClipboardList size={16} />
        <strong>Thông tin đặt lịch</strong>
      </div>
      <label>
        Họ và tên
        <input name="fullName" required placeholder="Nguyễn Văn A" />
      </label>
      <label>
        Số điện thoại
        <input
          name="phone"
          required
          type="tel"
          pattern="[0-9+\s]{8,15}"
          placeholder="09xx xxx xxx"
        />
      </label>
      <div className="ai-booking-grid">
        <label>
          Giới tính
          <select name="gender" required defaultValue="">
            <option value="" disabled>
              Chọn
            </option>
            <option>Nam</option>
            <option>Nữ</option>
            <option>Khác</option>
          </select>
        </label>
        <label>
          Ngày sinh
          <input name="dateOfBirth" required type="date" />
        </label>
      </div>
      <label>
        Cơ sở khám
        <select name="facility" required defaultValue={defaultFacility || ""}>
          <option value="" disabled>
            Chọn cơ sở
          </option>
          {hospitalLocations.map((item) => (
            <option value={item.facility} key={item.name}>
              {item.facility}
            </option>
          ))}
        </select>
      </label>
      <label>
        Chuyên khoa
        <select name="specialty" required defaultValue="">
          <option value="" disabled>
            Chọn chuyên khoa
          </option>
          {bookingSpecialties.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <div className="ai-booking-grid">
        <label>
          Ngày khám
          <select name="appointmentDate" required defaultValue="">
            <option value="" disabled>
              Chọn ngày
            </option>
            {dates.map((date) => (
              <option value={date} key={date}>
                {new Date(date).toLocaleDateString("vi-VN")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Giờ khám
          <select name="appointmentTime" required defaultValue="">
            <option value="" disabled>
              Chọn giờ
            </option>
            {bookingTimes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Lý do khám
        <textarea
          name="reason"
          required
          rows={3}
          placeholder="Mô tả ngắn triệu chứng hoặc nhu cầu khám..."
        />
      </label>
      <label className="ai-booking-terms">
        <input name="accepted" required type="checkbox" />
        <span>Tôi đồng ý để Vinmec liên hệ xác nhận lịch khám.</span>
      </label>
      {error && <div className="ai-action-error">{error}</div>}
      <button className="ai-action-primary" disabled={submitting} type="submit">
        {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"}
      </button>
      <Link className="ai-action-link" href="/dang-ky-kham">
        Mở trang đặt lịch đầy đủ
      </Link>
    </form>
  );
}

function MessageAction({
  message,
  onRequestLocation,
}: {
  message: Message;
  onRequestLocation: (messageId: number) => void;
}) {
  const action = message.action;
  if (!action) return null;

  if (action.type === "emergency") {
    return (
      <div className="ai-action-card ai-emergency-card">
        <div className="ai-action-heading">
          <AlertTriangle size={17} />
          <strong>Dấu hiệu có thể khẩn cấp</strong>
        </div>
        <a className="ai-emergency-call" href="tel:115">
          <PhoneCall size={17} /> Gọi 115 ngay
        </a>
        <Link className="ai-action-link" href="/dang-ky-kham">
          Vẫn muốn đặt lịch khám
        </Link>
      </div>
    );
  }

  if (action.type === "booking") {
    return <BookingActionForm />;
  }

  if (action.type === "nearby") {
    return (
      <div className="ai-action-card">
        <div className="ai-action-heading">
          <MapPin size={16} />
          <strong>Gợi ý cơ sở gần bạn</strong>
        </div>
        {action.status === "idle" && (
          <button
            className="ai-action-primary"
            type="button"
            onClick={() => onRequestLocation(message.id)}
          >
            <LocateFixed size={15} /> Dùng vị trí hiện tại
          </button>
        )}
        {action.status === "loading" && (
          <div className="ai-action-loading">
            <Loader2 size={15} /> Đang lấy vị trí...
          </div>
        )}
        {action.status === "error" && (
          <>
            <div className="ai-action-error">{action.error}</div>
            <Link className="ai-action-link" href="/dang-ky-kham">
              Chọn cơ sở thủ công
            </Link>
          </>
        )}
        {action.status === "ready" && action.hospital && (
          <>
            <div className="ai-nearest-result">
              <span>
                <Hospital size={15} />
                {action.hospital.label}
              </span>
              <strong>Khoảng {action.hospital.distanceKm.toFixed(1)} km</strong>
              <small>{action.hospital.address}</small>
            </div>
            <a
              className="ai-action-primary"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${action.hospital.facility} ${action.hospital.address}`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={15} /> Mở chỉ đường
            </a>
            <BookingActionForm defaultFacility={action.hospital.facility} />
          </>
        )}
      </div>
    );
  }

  return null;
}

export function AiChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý AI Vinmec. Tôi có thể hỗ trợ thông tin sức khỏe, tìm bác sĩ, gợi ý cơ sở gần bạn hoặc mở form đặt lịch khám.",
    },
  ]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (pathname.startsWith("/admin")) return null;

  function updateNearbyAction(messageId: number, action: ChatAction) {
    setMessages((items) =>
      items.map((item) =>
        item.id === messageId ? { ...item, action } : item,
      ),
    );
  }

  function requestLocation(messageId: number) {
    if (!navigator.geolocation) {
      updateNearbyAction(messageId, {
        type: "nearby",
        status: "error",
        error: "Trình duyệt của bạn không hỗ trợ định vị.",
      });
      return;
    }

    updateNearbyAction(messageId, { type: "nearby", status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestHospital(
          position.coords.latitude,
          position.coords.longitude,
        );
        if (!nearest) {
          updateNearbyAction(messageId, {
            type: "nearby",
            status: "error",
            error: "Chưa tìm được cơ sở Vinmec phù hợp.",
          });
          return;
        }
        updateNearbyAction(messageId, {
          type: "nearby",
          status: "ready",
          hospital: nearest,
        });
      },
      () => {
        updateNearbyAction(messageId, {
          type: "nearby",
          status: "error",
          error:
            "Bạn chưa cấp quyền vị trí. Bạn vẫn có thể chọn cơ sở thủ công trong trang đặt lịch.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function sendMessage(value: string) {
    const message = value.trim();
    if (!message || typing) return;
    const history = messages.map(({ role, content, followUpQuestion }) => ({
      role,
      content: followUpQuestion
        ? `${content}\n\nCâu hỏi thêm: ${followUpQuestion}`
        : content,
    }));
    const actionType = detectAction(message);
    setMessages((items) => [
      ...items,
      { id: Date.now(), role: "user", content: message },
    ]);
    setInput("");

    if (actionType === "emergency") {
      setMessages((items) => [
        ...items,
        createAssistantMessage(
          "Nếu bạn đang có triệu chứng nghiêm trọng như đau ngực, khó thở, ngất, co giật, dấu hiệu đột quỵ hoặc chảy máu không cầm, hãy gọi cấp cứu 115 ngay hoặc đến cơ sở y tế gần nhất. Chatbot không thay thế xử trí cấp cứu.",
          { type: "emergency" },
        ),
      ]);
      return;
    }

    if (actionType === "booking") {
      setMessages((items) => [
        ...items,
        createAssistantMessage(
          "Mình mở form đặt lịch nhanh ngay tại đây. Bạn điền thông tin, Vinmec sẽ liên hệ xác nhận lịch khám.",
          { type: "booking" },
        ),
      ]);
      return;
    }

    if (actionType === "nearby") {
      setMessages((items) => [
        ...items,
        createAssistantMessage(
          "Mình có thể dùng vị trí hiện tại để gợi ý cơ sở Vinmec gần bạn nhất. Trình duyệt sẽ hỏi quyền vị trí trước khi lấy tọa độ.",
          { type: "nearby", status: "idle" },
        ),
      ]);
      return;
    }

    setTyping(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const result = await response.json();
      setMessages((items) => [
        ...items,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            result.answer ||
            result.error ||
            "Trợ lý AI chưa thể phản hồi lúc này.",
          confidence: result.confidence,
          confidenceLabel: result.confidenceLabel,
          confidenceReason: result.confidenceReason,
          followUpQuestion: result.followUpQuestion,
        },
      ]);
    } catch {
      setMessages((items) => [
        ...items,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Không thể kết nối tới dịch vụ AI. Vui lòng thử lại sau hoặc gọi tổng đài 1900 232 389.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className={`ai-widget ${open ? "is-open" : ""}`}>
      {open && (
        <section className="ai-chat-panel" aria-label="Trợ lý AI Vinmec">
          <header className="ai-chat-header">
            <div className="ai-chat-avatar">
              <Bot />
              <span />
            </div>
            <div>
              <strong>Trợ lý AI Vinmec</strong>
              <span>
                <i /> Gemini + kho tri thức
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Thu nhỏ cửa sổ chat"
            >
              <Minimize2 />
            </button>
          </header>

          <div className="ai-chat-notice">
            <Sparkles size={14} />
            Chỉ hỗ trợ chủ đề y tế và Vinmec. Nếu có dấu hiệu khẩn cấp, hãy gọi
            115 ngay.
          </div>

          <div className="ai-chat-messages">
            {messages.map((message) => (
              <div className={`ai-message ${message.role}`} key={message.id}>
                {message.role === "assistant" && (
                  <span className="ai-message-icon">
                    <Bot size={14} />
                  </span>
                )}
                <div className="ai-message-content">
                  <p>{message.content}</p>
                  {message.role === "assistant" && (
                    <MessageAction
                      message={message}
                      onRequestLocation={requestLocation}
                    />
                  )}
                  {message.role === "assistant" &&
                    message.followUpQuestion && (
                      <div className="ai-follow-up">
                        <strong>Gemini hỏi thêm</strong>
                        <span>{message.followUpQuestion}</span>
                      </div>
                    )}
                  {message.role === "assistant" &&
                    typeof message.confidence === "number" &&
                    message.confidence > 0 && (
                      <div
                        className="ai-confidence"
                        title="Gemini đọc lại câu trả lời và tự chấm theo bằng chứng; đây không phải xác suất chẩn đoán."
                      >
                        <span
                          className="ai-confidence-ring"
                          style={
                            {
                              "--confidence-angle": `${message.confidence * 3.6}deg`,
                              "--confidence-color":
                                message.confidence >= 80
                                  ? "#008ca8"
                                  : message.confidence >= 60
                                    ? "#d58a00"
                                    : "#d15b47",
                            } as CSSProperties
                          }
                          aria-label={`${message.confidenceLabel ?? "Độ tin cậy tham khảo"}: ${message.confidence}%`}
                        >
                          <strong>{message.confidence}%</strong>
                        </span>
                        <span>
                          {message.confidenceLabel ?? "Độ tin cậy tham khảo"}
                          {message.confidenceReason && (
                            <small>{message.confidenceReason}</small>
                          )}
                          <small>Không thay thế chẩn đoán</small>
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="ai-message assistant">
                <span className="ai-message-icon">
                  <Bot size={14} />
                </span>
                <span className="typing-dots">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {messages.length < 4 && (
            <div className="ai-quick-questions">
              {quickQuestions.map((question) => (
                <button
                  type="button"
                  onClick={() => void sendMessage(question)}
                  key={question}
                >
                  {question} <ChevronRight size={13} />
                </button>
              ))}
            </div>
          )}

          <div className="ai-chat-shortcuts">
            <Link href="/dang-ky-kham" onClick={() => setOpen(false)}>
              <CalendarDays size={15} /> Đặt lịch
            </Link>
            <Link href="/bac-si" onClick={() => setOpen(false)}>
              <Stethoscope size={15} /> Tìm bác sĩ
            </Link>
          </div>

          <form className="ai-chat-input" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Hỏi Gemini hoặc nhập nhu cầu khám..."
              aria-label="Nhập tin nhắn"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Gửi tin nhắn"
            >
              <Send />
            </button>
          </form>
        </section>
      )}

      {!open && (
        <button
          type="button"
          className="ai-chat-launcher"
          onClick={() => setOpen(true)}
          aria-label="Chat với AI Vinmec"
        >
          <span className="ai-launcher-avatar">
            <Bot />
            <i />
          </span>
          <span className="ai-launcher-copy">
            <small>Powered by Gemini</small>
            <strong>Chat với AI Vinmec</strong>
          </span>
          <MessageCircle className="ai-launcher-chat-icon" />
        </button>
      )}

      {open && (
        <button
          type="button"
          className="ai-chat-mobile-close"
          onClick={() => setOpen(false)}
          aria-label="Đóng chat"
        >
          <X />
        </button>
      )}
    </div>
  );
}
