import { promises as fs } from "fs";
import path from "path";
import type { AiConfig } from "@/lib/ai-types";

const configFile = path.join(process.cwd(), "data", "ai", "config.json");

export async function getAiConfig(): Promise<AiConfig> {
  const raw = await fs.readFile(configFile, "utf8");
  return JSON.parse(raw) as AiConfig;
}

export async function saveAiConfig(input: AiConfig) {
  const config: AiConfig = {
    enabled: Boolean(input.enabled),
    mode: input.mode,
    endpoint: input.endpoint.trim(),
    model: input.model.trim(),
    temperature: Math.min(2, Math.max(0, Number(input.temperature) || 0)),
    topK: Math.min(10, Math.max(1, Number(input.topK) || 4)),
    systemPrompt: input.systemPrompt.trim(),
  };
  await fs.writeFile(configFile, JSON.stringify(config, null, 2), "utf8");
  return config;
}
