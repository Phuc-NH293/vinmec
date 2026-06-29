import { promises as fs } from "fs";
import path from "path";
import type {
  KnowledgeDocument,
  KnowledgeMatch,
} from "@/lib/ai-types";

const dataDir = path.join(process.cwd(), "data", "ai");
const uploadsDir = path.join(dataDir, "uploads");
const documentsFile = path.join(dataDir, "documents.json");
const supportedExtensions = new Set([".pdf", ".docx", ".txt", ".md"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function readDocuments(): Promise<KnowledgeDocument[]> {
  const raw = await fs.readFile(documentsFile, "utf8");
  return JSON.parse(raw) as KnowledgeDocument[];
}

async function writeDocuments(documents: KnowledgeDocument[]) {
  await fs.writeFile(
    documentsFile,
    JSON.stringify(documents, null, 2),
    "utf8",
  );
}

function normalizeText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoChunks(text: string, size = 1200, overlap = 180) {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const paragraphEnd = text.lastIndexOf("\n", end);
      const sentenceEnd = text.lastIndexOf(". ", end);
      const boundary = Math.max(paragraphEnd, sentenceEnd);
      if (boundary > start + size * 0.55) end = boundary + 1;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

async function extractText(buffer: Buffer, extension: string) {
  if (extension === ".txt" || extension === ".md") {
    return buffer.toString("utf8");
  }
  if (extension === ".docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (extension === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  throw new Error("UNSUPPORTED_FILE");
}

export async function listKnowledgeDocuments() {
  const documents = await readDocuments();
  return documents
    .map(({ chunks, ...document }) => ({
      ...document,
      chunkCount: chunks.length,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function addKnowledgeDocument(file: File) {
  if (!file.name || file.size === 0) throw new Error("EMPTY_FILE");
  if (file.size > MAX_FILE_SIZE) throw new Error("FILE_TOO_LARGE");
  const extension = path.extname(file.name).toLowerCase();
  if (!supportedExtensions.has(extension)) throw new Error("UNSUPPORTED_FILE");

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = normalizeText(await extractText(buffer, extension));
  if (text.length < 20) throw new Error("NO_TEXT_FOUND");

  const id = crypto.randomUUID();
  const storedFile = `${id}${extension}`;
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, storedFile), buffer);

  const chunks = splitIntoChunks(text).map((chunk, index) => ({
    id: `${id}-${index + 1}`,
    text: chunk,
  }));
  const document: KnowledgeDocument = {
    id,
    name: path.basename(file.name),
    type: extension.slice(1).toUpperCase(),
    size: file.size,
    storedFile,
    characters: text.length,
    chunks,
    createdAt: new Date().toISOString(),
  };
  const documents = await readDocuments();
  documents.unshift(document);
  await writeDocuments(documents);
  return { ...document, chunkCount: chunks.length, chunks: undefined };
}

export async function deleteKnowledgeDocument(id: string) {
  const documents = await readDocuments();
  const document = documents.find((item) => item.id === id);
  if (!document) return false;
  const nextDocuments = documents.filter((item) => item.id !== id);
  await writeDocuments(nextDocuments);
  const filePath = path.resolve(uploadsDir, document.storedFile);
  if (filePath.startsWith(path.resolve(uploadsDir))) {
    await fs.rm(filePath, { force: true });
  }
  return true;
}

function terms(value: string) {
  return Array.from(
    new Set(
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length > 2),
    ),
  );
}

export async function searchKnowledge(query: string, topK: number) {
  const queryTerms = terms(query);
  if (!queryTerms.length) return [];
  const documents = await readDocuments();
  const matches: KnowledgeMatch[] = [];

  for (const document of documents) {
    for (const chunk of document.chunks) {
      const normalized = terms(chunk.text);
      const chunkTerms = new Set(normalized);
      const hits = queryTerms.filter((term) => chunkTerms.has(term)).length;
      if (!hits) continue;
      const exactBoost = chunk.text
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi"))
        ? 3
        : 0;
      matches.push({
        documentId: document.id,
        documentName: document.name,
        chunkId: chunk.id,
        text: chunk.text,
        score: hits / queryTerms.length + exactBoost,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, topK);
}
