export type AgentIntent = "emergency" | "booking" | "nearby" | "general";

export function normalizeAgentText(value: string) {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function includesAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

export function classifyAgentIntent(message: string): AgentIntent {
  const normalized = normalizeAgentText(message);

  if (
    includesAny(normalized, [
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
    ])
  ) {
    return "emergency";
  }

  if (
    includesAny(normalized, [
      "muon di kham",
      "di kham o dau",
      "benh vien gan",
      "co so gan",
      "gan nhat",
      "gan toi",
      "lay vi tri",
      "vi tri hien tai",
    ])
  ) {
    return "nearby";
  }

  if (
    includesAny(normalized, [
      "dat lich",
      "dang ky kham",
      "hen kham",
      "lich kham",
      "dat hen",
    ])
  ) {
    return "booking";
  }

  return "general";
}
