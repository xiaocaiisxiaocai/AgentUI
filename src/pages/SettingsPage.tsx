import React, { useState } from "react";
import {
  Settings,
  Copy,
  Check,
  Play,
} from "lucide-react";
import { OpenApiEndpoint, AppLanguage } from "../types";

const defaultEndpoints: OpenApiEndpoint[] = [
  {
    id: "ep-1",
    name: "Agent 对话交互接口 (Chat Completions)",
    method: "POST",
    path: "/api/v1/chat/completions",
    departmentScope: "售后技术部 / 运营助理部",
    status: "active",
    description: "兼容 OpenAI / Anthropic 格式的标准 RESTful 对话接口，自动执行企业级 RAG 与安全审计。",
    sampleRequest: JSON.stringify(
      {
        model: "agent-supervisor",
        messages: [{ role: "user", content: "查询 IPMS 504 Gateway Timeout 解决办法" }],
        department: "售后技术部",
      },
      null,
      2
    ),
    sampleResponse: JSON.stringify(
      {
        id: "chatcmpl-9812",
        agentId: "agent-supervisor",
        text: "根据售后技术部手册 §3.2 结论，建议核查 24V 供电与交换机凭证。",
        citations: [{ docTitle: "售后技术部手册_v3.2.pdf", section: "§ 3.2" }],
      },
      null,
      2
    ),
  },
  {
    id: "ep-2",
    name: "知识库增量向量化注入 (Knowledge Ingestion)",
    method: "POST",
    path: "/api/v1/knowledge/documents/ingest",
    departmentScope: "全行通用",
    status: "active",
    description: "供外部 OA 或 FTP 定时调用的文档解析与 Chunk 向量切片自动构建接口。",
    sampleRequest: JSON.stringify(
      {
        kbId: "kb-ipms-history",
        docTitle: "2026_Q2_新硬件模块排障手册.pdf",
        fileUrl: "https://oa.company.com/files/manual.pdf",
      },
      null,
      2
    ),
    sampleResponse: JSON.stringify(
      { status: "processing", taskId: "task-ingest-883", chunksCreated: 142 },
      null,
      2
    ),
  },
];

interface SettingsPageProps {
  endpoints?: OpenApiEndpoint[];
  lang?: AppLanguage;
}

export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  const endpoints = props.endpoints || defaultEndpoints;

  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenApiEndpoint>(
    endpoints[0] || defaultEndpoints[0]
  );
  const [copied, setCopied] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRunApiTest = () => {
    setIsTesting(true);
    setTestResponse(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResponse(selectedEndpoint.sampleResponse);
    }, 600);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
          <Settings className="w-6 h-6 text-blue-400" />
          <span>平台管理与 OpenAPI 网关 (Platform & OpenAPI Hub)</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
          为外部 OA、ERP、第三方 Agent 开放 RESTful HTTP / Webhook 接口，并配置多部门隔离 API Key。
        </p>
      </div>

      {/* OpenAPI Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="font-bold text-xs font-mono text-slate-300">开放 API 接口目录 ({endpoints.length})</h3>
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              onClick={() => {
                setSelectedEndpoint(ep);
                setTestResponse(null);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer space-y-1.5 transition-all ${
                selectedEndpoint?.id === ep.id
                  ? "border-blue-500 bg-blue-500/10 font-bold text-blue-300"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">
                  {ep.method}
                </span>
                <span className="text-slate-200 text-xs font-mono truncate">{ep.path}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{ep.name}</p>
            </div>
          ))}
        </div>

        {/* Selected API Interactive Test Console */}
        <div className="lg:col-span-2 space-y-4 p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-100">{selectedEndpoint?.name}</h3>
              <span className="text-xs font-mono text-blue-400">
                {selectedEndpoint?.method} {selectedEndpoint?.path}
              </span>
            </div>

            <button
              onClick={() => handleCopy(selectedEndpoint?.sampleRequest || "")}
              className="px-3 py-1.5 rounded border border-white/10 text-slate-300 hover:bg-white/5 font-mono text-xs flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制 Payload" : "复制 Payload"}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">{selectedEndpoint?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-bold mb-1">示例 Request JSON Payload</label>
              <pre className="p-3 rounded bg-black border border-white/10 text-blue-300 overflow-x-auto h-48">
                {selectedEndpoint?.sampleRequest}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-bold">测试运行与 Response</label>
                <button
                  onClick={handleRunApiTest}
                  disabled={isTesting}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <Play className="w-3 h-3" />
                  <span>{isTesting ? "请求中..." : "测试发起 HTTP 请求"}</span>
                </button>
              </div>
              <pre className="p-3 rounded bg-black border border-white/10 text-emerald-400 overflow-x-auto h-48">
                {testResponse || "// 点击“测试发起 HTTP 请求”进行在线联调"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
