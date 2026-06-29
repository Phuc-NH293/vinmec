import type { ChatMessage } from "@/lib/ai-types";

export type AgentLocation = {
  lat: number;
  lon: number;
};

export type AgentFacility = {
  name: string;
  facility: string;
  label: string;
  address: string;
  lat: number;
  lon: number;
};

export type AgentNearestFacility = AgentFacility & {
  distanceKm: number;
};

export type AgentAction =
  | { type: "emergency" }
  | { type: "booking" }
  | {
      type: "nearby";
      status: "idle" | "ready" | "error";
      locationQuery?: string;
      hospital?: AgentNearestFacility;
      error?: string;
    };

export type AgentRequest = {
  message: string;
  history: ChatMessage[];
  location?: AgentLocation;
};

export type AgentResponse = {
  answer: string;
  source: string;
  sources: string[];
  action?: AgentAction;
  confidence?: number;
  confidenceLabel?: string;
  confidenceReason?: string;
  followUpQuestion?: string;
};
