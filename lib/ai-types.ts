export type AiMode = "knowledge_only" | "knowledge_then_llm" | "llm_only";

export type AiConfig = {
  enabled: boolean;
  mode: AiMode;
  endpoint: string;
  model: string;
  temperature: number;
  topK: number;
  systemPrompt: string;
};

export type KnowledgeChunk = {
  id: string;
  text: string;
};

export type KnowledgeDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  storedFile: string;
  characters: number;
  chunks: KnowledgeChunk[];
  createdAt: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type KnowledgeMatch = {
  documentId: string;
  documentName: string;
  chunkId: string;
  text: string;
  score: number;
};
