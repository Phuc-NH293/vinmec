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
import { vinmecFacilities } from "@/lib/agent/tools/facilities";
import type {
  AgentAction,
  AgentLocation,
  AgentNearestFacility,
} from "@/lib/agent/types";

type ChatAction =
  | AgentAction
  | {
      type: "nearby";
      status: "loading";
      locationQuery?: string;
      hospital?: AgentNearestFacility;
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

type AgentChatResult = {
  answer?: string;
  error?: string;
  action?: AgentAction;
  confidence?: number;
  confidenceLabel?: string;
  confidenceReason?: string;
  followUpQuestion?: string;
};

const quickQuestions = [
  "Tôi muốn đặt lịch khám",
  "Tôi muốn đi khám ở bệnh viện gần nhất",
  "Đau ngực khó thở phải làm gì?",
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

let messageSequence = 1;

function createMessageId() {
  messageSequence += 1;
  return messageSequence;
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

function createAssistantMessage(
  content: string,
  action?: ChatAction,
  extra?: Partial<Message>,
): Message {
  return {
    id: createMessageId(),
    role: "assistant",
    content,
    action,
    ...extra,
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
          {vinmecFacilities.map((item) => (
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
  onRequestLocation: (message: Message) => void;
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
            onClick={() => onRequestLocation(message)}
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
        "Xin chào! Tôi là agent AI Vinmec. Tôi có thể hỗ trợ thông tin sức khỏe, tìm bác sĩ, gợi ý cơ sở gần bạn hoặc mở form đặt lịch khám.",
    },
  ]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (pathname.startsWith("/admin")) return null;

  function buildHistory(items = messages) {
    return items.map(({ role, content, followUpQuestion }) => ({
      role,
      content: followUpQuestion
        ? `${content}\n\nCâu hỏi thêm: ${followUpQuestion}`
        : content,
    }));
  }

  async function callAgent(
    message: string,
    options: {
      location?: AgentLocation;
      history?: ReturnType<typeof buildHistory>;
    } = {},
  ) {
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: options.history ?? buildHistory(),
        location: options.location,
      }),
    });
    return (await response.json()) as AgentChatResult;
  }

  function updateMessage(messageId: number, patch: Partial<Message>) {
    setMessages((items) =>
      items.map((item) => (item.id === messageId ? { ...item, ...patch } : item)),
    );
  }

  function updateNearbyAction(messageId: number, action: ChatAction) {
    updateMessage(messageId, { action });
  }

  function requestLocation(message: Message) {
    if (!navigator.geolocation) {
      updateNearbyAction(message.id, {
        type: "nearby",
        status: "error",
        error: "Trình duyệt của bạn không hỗ trợ định vị.",
      });
      return;
    }

    const query =
      message.action?.type === "nearby" && "locationQuery" in message.action
        ? message.action.locationQuery || message.content
        : message.content;

    updateNearbyAction(message.id, {
      type: "nearby",
      status: "loading",
      locationQuery: query,
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await callAgent(query, {
            location: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            },
          });
          updateMessage(message.id, {
            content:
              result.answer ||
              result.error ||
              "Agent chưa thể tìm cơ sở phù hợp lúc này.",
            action: result.action,
            confidence: result.confidence,
            confidenceLabel: result.confidenceLabel,
            confidenceReason: result.confidenceReason,
            followUpQuestion: result.followUpQuestion,
          });
        } catch {
          updateNearbyAction(message.id, {
            type: "nearby",
            status: "error",
            error: "Không thể gửi vị trí tới agent. Vui lòng thử lại.",
          });
        }
      },
      () => {
        updateNearbyAction(message.id, {
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
    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: message,
    };
    const history = buildHistory([...messages, userMessage]);
    setMessages((items) => [...items, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const result = await callAgent(message, { history });
      setMessages((items) => [
        ...items,
        createAssistantMessage(
          result.answer ||
            result.error ||
            "Agent AI chưa thể phản hồi lúc này.",
          result.action,
          {
            confidence: result.confidence,
            confidenceLabel: result.confidenceLabel,
            confidenceReason: result.confidenceReason,
            followUpQuestion: result.followUpQuestion,
          },
        ),
      ]);
    } catch {
      setMessages((items) => [
        ...items,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            "Không thể kết nối tới agent AI. Vui lòng thử lại sau hoặc gọi tổng đài 1900 232 389.",
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
        <section className="ai-chat-panel" aria-label="Agent AI Vinmec">
          <header className="ai-chat-header">
            <div className="ai-chat-avatar">
              <Bot />
              <span />
            </div>
            <div>
              <strong>Agent AI Vinmec</strong>
              <span>
                <i /> Agent + Gemini + tool y tế
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
            Agent chỉ hỗ trợ chủ đề y tế và Vinmec. Nếu có dấu hiệu khẩn cấp,
            hãy gọi 115 ngay.
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
                        <strong>Agent hỏi thêm</strong>
                        <span>{message.followUpQuestion}</span>
                      </div>
                    )}
                  {message.role === "assistant" &&
                    typeof message.confidence === "number" &&
                    message.confidence > 0 && (
                      <div
                        className="ai-confidence"
                        title="Agent đọc lại câu trả lời và tự chấm theo bằng chứng; đây không phải xác suất chẩn đoán."
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
              placeholder="Hỏi agent hoặc nhập nhu cầu khám..."
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
          aria-label="Chat với Agent AI Vinmec"
        >
          <span className="ai-launcher-avatar">
            <Bot />
            <i />
          </span>
          <span className="ai-launcher-copy">
            <small>Agent + Gemini</small>
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
