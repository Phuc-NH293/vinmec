import { answerChat } from "@/lib/ai-chat";
import {
  findNearestFacility,
} from "@/lib/agent/tools/facilities";
import { classifyAgentIntent } from "@/lib/agent/tools/intent";
import type { AgentRequest, AgentResponse } from "@/lib/agent/types";

function emergencyResponse(): AgentResponse {
  return {
    answer:
      "Nếu bạn đang có triệu chứng nghiêm trọng như đau ngực, khó thở, ngất, co giật, dấu hiệu đột quỵ hoặc chảy máu không cầm, hãy gọi cấp cứu 115 ngay hoặc đến cơ sở y tế gần nhất. Chatbot không thay thế xử trí cấp cứu.",
    source: "agent:triage_emergency",
    sources: [],
    action: { type: "emergency" },
  };
}

function bookingResponse(): AgentResponse {
  return {
    answer:
      "Mình mở form đặt lịch nhanh ngay tại đây. Bạn điền thông tin, Vinmec sẽ liên hệ xác nhận lịch khám.",
    source: "agent:create_appointment_form",
    sources: [],
    action: { type: "booking" },
  };
}

function unsafeMedicalRequestResponse(): AgentResponse {
  return {
    answer:
      "Mình không thể chẩn đoán bệnh, kê đơn, đưa phác đồ điều trị hoặc liều dùng thuốc ngay trong chat. Mình có thể giúp bạn mô tả triệu chứng, nhận diện dấu hiệu cần đi khám/cấp cứu, gợi ý chuyên khoa phù hợp và hỗ trợ đặt lịch với bác sĩ Vinmec.",
    source: "agent:medical_safety_guard",
    sources: [],
    action: { type: "booking" },
  };
}

function requestLocationResponse(message: string): AgentResponse {
  return {
    answer:
      "Mình có thể dùng vị trí hiện tại để gợi ý cơ sở Vinmec gần bạn nhất. Trình duyệt sẽ hỏi quyền vị trí trước khi lấy tọa độ.",
    source: "agent:request_location",
    sources: [],
    action: {
      type: "nearby",
      status: "idle",
      locationQuery: message,
    },
  };
}

function nearestFacilityResponse(request: AgentRequest): AgentResponse {
  if (!request.location) return requestLocationResponse(request.message);

  const nearest = findNearestFacility(request.location);
  if (!nearest) {
    return {
      answer:
        "Mình chưa tìm được cơ sở Vinmec phù hợp từ vị trí hiện tại. Bạn vẫn có thể chọn cơ sở thủ công trong form đặt lịch.",
      source: "agent:find_nearest_facility",
      sources: [],
      action: {
        type: "nearby",
        status: "error",
        error: "Chưa tìm được cơ sở Vinmec phù hợp.",
      },
    };
  }

  return {
    answer: `Cơ sở Vinmec gần bạn nhất là ${nearest.label}, khoảng ${nearest.distanceKm.toFixed(
      1,
    )} km. Mình đã chuẩn bị form đặt lịch với cơ sở này.`,
    source: "agent:find_nearest_facility",
    sources: [],
    action: {
      type: "nearby",
      status: "ready",
      hospital: nearest,
    },
  };
}

export async function runVinmecAgent(
  request: AgentRequest,
): Promise<AgentResponse> {
  const message = request.message.trim();
  if (!message) {
    return {
      answer: "Vui lòng nhập câu hỏi hoặc nhu cầu khám.",
      source: "agent:validation",
      sources: [],
    };
  }

  if (request.location) return nearestFacilityResponse(request);

  const intent = classifyAgentIntent(message);
  if (intent === "emergency") return emergencyResponse();
  if (intent === "unsafe_medical_request") {
    return unsafeMedicalRequestResponse();
  }
  if (intent === "booking") return bookingResponse();
  if (intent === "nearby") return requestLocationResponse(message);

  const result = await answerChat(message, request.history);
  return {
    answer: result.answer,
    source: result.source,
    sources: result.sources,
    confidence: result.confidence,
    confidenceLabel: result.confidenceLabel,
    confidenceReason: result.confidenceReason,
    followUpQuestion: result.followUpQuestion,
  };
}
