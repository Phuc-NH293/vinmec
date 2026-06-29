"use client";

import {
  Bot,
  BrainCircuit,
  Database,
  FileText,
  KeyRound,
  LoaderCircle,
  PlugZap,
  Save,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { AiConfig, AiMode } from "@/lib/ai-types";

type ConfigResponse = AiConfig & { hasApiKey: boolean };

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  characters: number;
  chunkCount: number;
  createdAt: string;
};

const defaultConfig: ConfigResponse = {
  enabled: true,
  mode: "knowledge_then_llm",
  endpoint: "google-gemini",
  model: "gemini-2.5-flash",
  temperature: 1,
  topK: 4,
  systemPrompt:
    "Bạn là trợ lý AI chuyên về y tế và dịch vụ Vinmec. Chỉ trả lời câu hỏi thuộc lĩnh vực y tế. Từ chối mọi chủ đề khác. Ưu tiên trả lời theo kho tri thức, không tự chẩn đoán hoặc kê đơn.",
  hasApiKey: false,
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AiAdminStudio() {
  const [config, setConfig] = useState(defaultConfig);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    const response = await fetch("/api/admin/ai/knowledge");
    if (response.ok) setDocuments(await response.json());
  }

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/ai/config"),
      fetch("/api/admin/ai/knowledge"),
    ])
      .then(async ([configResponse, documentResponse]) => {
        if (configResponse.ok) setConfig(await configResponse.json());
        if (documentResponse.ok) setDocuments(await documentResponse.json());
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof ConfigResponse>(
    key: K,
    value: ConfigResponse[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  async function saveConfig(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/ai/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(result.error || "Không thể lưu cấu hình.");
      return;
    }
    setConfig((current) => ({ ...current, ...result }));
    setMessage("Đã lưu cấu hình Gemini.");
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    setMessage("");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    const response = await fetch("/api/admin/ai/knowledge", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
    if (!response.ok) {
      setError(result.error || "Không thể tải tài liệu.");
      return;
    }
    setMessage(`Đã thêm ${result.length} tài liệu vào kho tri thức.`);
    await loadDocuments();
  }

  async function removeDocument(document: DocumentItem) {
    if (!window.confirm(`Xóa tài liệu “${document.name}”?`)) return;
    const response = await fetch(
      `/api/admin/ai/knowledge/${document.id}`,
      { method: "DELETE" },
    );
    if (response.ok) {
      setDocuments((items) =>
        items.filter((item) => item.id !== document.id),
      );
    }
  }

  async function testConnection() {
    setTesting(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/ai/test", { method: "POST" });
    const result = await response.json();
    setTesting(false);
    if (!response.ok) {
      setError(result.message || "Không thể kết nối Gemini.");
      return;
    }
    setMessage(result.message);
  }

  if (loading) {
    return (
      <div className="ai-admin-loading">
        <LoaderCircle /> Đang tải Gemini Studio...
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="admin-kicker">Gemini + RAG</span>
          <h1>AI Knowledge Studio</h1>
          <p>
            Cấu hình Gemini 3 Flash và quản lý tài liệu dùng để trả lời.
          </p>
        </div>
        <div className={`ai-runtime-status ${config.enabled ? "on" : "off"}`}>
          <span />
          {config.enabled ? "Trợ lý đang hoạt động" : "Trợ lý đang tắt"}
        </div>
      </div>

      {message && <div className="ai-admin-message success">{message}</div>}
      {error && <div className="ai-admin-message error">{error}</div>}

      <div className="ai-admin-summary">
        <div>
          <span className="stat-icon blue">
            <Database />
          </span>
          <strong>{documents.length}</strong>
          <small>Tài liệu tri thức</small>
        </div>
        <div>
          <span className="stat-icon green">
            <BrainCircuit />
          </span>
          <strong>
            {documents.reduce((sum, item) => sum + item.chunkCount, 0)}
          </strong>
          <small>Đoạn dữ liệu truy xuất</small>
        </div>
        <div>
          <span className="stat-icon violet">
            <Bot />
          </span>
          <strong>{config.model || "Chưa chọn"}</strong>
          <small>Model Gemini</small>
        </div>
        <div>
          <span className="stat-icon orange">
            <KeyRound />
          </span>
          <strong>{config.hasApiKey ? "Đã có key" : "Chưa có key"}</strong>
          <small>GEMINI_API_KEY</small>
        </div>
      </div>

      <div className="ai-admin-layout">
        <section className="admin-card ai-config-card">
          <div className="ai-admin-card-heading">
            <span>
              <ServerCog />
            </span>
            <div>
              <h2>Cấu hình Gemini</h2>
              <p>Gemini nhận câu hỏi, lịch sử chat và các đoạn tài liệu RAG.</p>
            </div>
          </div>
          <form className="ai-config-form" onSubmit={saveConfig}>
            <label className="ai-switch-row">
              <span>
                <strong>Bật trợ lý AI</strong>
                <small>Cho phép widget xử lý câu hỏi của người dùng.</small>
              </span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(event) => update("enabled", event.target.checked)}
              />
            </label>
            <label>
              Chế độ trả lời
              <select
                value={config.mode}
                onChange={(event) =>
                  update("mode", event.target.value as AiMode)
                }
              >
                <option value="knowledge_then_llm">
                  Tài liệu → Gemini → dự phòng
                </option>
                <option value="knowledge_only">Chỉ dùng tài liệu</option>
                <option value="llm_only">Chỉ dùng Gemini</option>
              </select>
            </label>
            <div className="ai-config-grid gemini-grid">
              <label>
                Model
                <input
                  value={config.model}
                  onChange={(event) => update("model", event.target.value)}
                  placeholder="gemini-2.5-flash"
                />
                <small>
                  Model gợi ý: <code>gemini-2.5-flash</code>.
                </small>
              </label>
              <label>
                Top K tài liệu
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.topK}
                  onChange={(event) =>
                    update("topK", Number(event.target.value))
                  }
                />
              </label>
            </div>
            <label>
              System prompt
              <textarea
                rows={7}
                value={config.systemPrompt}
                onChange={(event) =>
                  update("systemPrompt", event.target.value)
                }
              />
            </label>
            <div className="ai-api-key-note">
              <ShieldCheck />
              <div>
                <strong>
                  GEMINI_API_KEY:{" "}
                  {config.hasApiKey ? "Đã cấu hình" : "Chưa cấu hình"}
                </strong>
                <span>
                  Dán key vào file <code>.env.local</code>, không lưu key trong
                  trình duyệt hoặc JSON.
                </span>
              </div>
            </div>
            <div className="gemini-config-actions">
              <button
                type="button"
                className="button button-outline"
                disabled={testing}
                onClick={testConnection}
              >
                <PlugZap size={17} />
                {testing ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
              </button>
              <button className="button button-primary" disabled={saving}>
                <Save size={17} />
                {saving ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-card ai-knowledge-card">
          <div className="ai-admin-card-heading">
            <span>
              <Database />
            </span>
            <div>
              <h2>Kho tri thức RAG</h2>
              <p>Tải PDF, DOCX, TXT hoặc Markdown, tối đa 10 MB/tệp.</p>
            </div>
          </div>

          <label
            className={`ai-upload-zone ${uploading ? "uploading" : ""}`}
          >
            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md"
              onChange={(event) => uploadFiles(event.target.files)}
              disabled={uploading}
            />
            {uploading ? <LoaderCircle /> : <UploadCloud />}
            <strong>
              {uploading ? "Đang trích xuất nội dung..." : "Tải tài liệu lên"}
            </strong>
            <span>Nhấn để chọn PDF, DOCX, TXT hoặc Markdown</span>
          </label>

          <div className="ai-document-list">
            {documents.length ? (
              documents.map((document) => (
                <article key={document.id}>
                  <span
                    className={`ai-file-type ${document.type.toLowerCase()}`}
                  >
                    <FileText />
                    {document.type}
                  </span>
                  <div>
                    <strong>{document.name}</strong>
                    <span>
                      {formatBytes(document.size)} · {document.chunkCount} đoạn
                      · {document.characters.toLocaleString("vi-VN")} ký tự
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(document)}
                    aria-label={`Xóa ${document.name}`}
                  >
                    <Trash2 />
                  </button>
                </article>
              ))
            ) : (
              <div className="ai-document-empty">
                <Sparkles />
                <strong>Chưa có tài liệu</strong>
                <p>
                  Khi chưa tải tài liệu, Gemini sẽ trả lời bằng kiến thức của
                  mô hình nếu API key đã được cấu hình.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="admin-card ai-contract-card gemini-flow-card">
        <div className="ai-admin-card-heading">
          <span>
            <Bot />
          </span>
          <div>
            <h2>Pipeline trả lời hiện tại</h2>
            <p>
              Câu hỏi được tìm trong tài liệu trước rồi gửi context cho Gemini.
            </p>
          </div>
        </div>
        <div className="gemini-flow">
          <span>Câu hỏi người dùng</span>
          <i>→</i>
          <span>Tìm Top K đoạn tài liệu</span>
          <i>→</i>
          <span>Gemini 3 Flash</span>
          <i>→</i>
          <span>Câu trả lời tiếng Việt</span>
        </div>
      </section>
    </>
  );
}
