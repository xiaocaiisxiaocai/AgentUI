import React, { useState } from "react";
import {
  Settings,
  Copy,
  Check,
  Play,
  ShieldCheck,
  Key,
  Globe,
  Activity,
  Lock,
  Layers,
  Building2,
  Server
} from "lucide-react";
import { OpenApiEndpoint, AppEnvironment } from "../types";
import { useAppStore } from "../store/useAppStore";

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

const mockCredentials = [
  {
    id: "cred-ipms-prod-01",
    name: "IPMS 核心数据库物理凭证",
    type: "PostgreSQL Connection String",
    maskedSecret: "postgresql://ipms_app:********@10.200.14.88:5432/ipms_prod",
    usedByCount: 4,
    lastVerified: "2026-07-24 10:00",
    status: "Healthy",
  },
  {
    id: "cred-openai-key-02",
    name: "全行 Gemini / OpenAI 向量大模型 API Key",
    type: "API Bearer Token",
    maskedSecret: "sk-proj-************************************xA9K",
    usedByCount: 6,
    lastVerified: "2026-07-24 09:45",
    status: "Healthy",
  },
  {
    id: "cred-sharepoint-oauth-03",
    name: "SharePoint 售后文档同步 OAuth 2.0 Client",
    type: "OAuth2 Client Credentials",
    maskedSecret: "client_id=sp-app-8812&client_secret=********",
    usedByCount: 2,
    lastVerified: "2026-07-24 08:30",
    status: "Healthy",
  },
];

const mockAuditLogs = [
  {
    id: "audit-101",
    timestamp: "2026-07-24 10:14:12",
    actor: "Operator (张伟)",
    action: "APPROVAL_GRANT",
    target: "IPMS 物理写入工单 [AOI-03]",
    department: "售后技术部",
    ip: "10.20.14.102",
    result: "SUCCESS",
  },
  {
    id: "audit-102",
    timestamp: "2026-07-24 09:50:00",
    actor: "System Agent (工单生成 Agent)",
    action: "HIGH_RISK_INTERCEPT",
    target: "IPMS 端口复位写 API",
    department: "售后技术部",
    ip: "10.200.1.1",
    result: "WAITING_APPROVAL",
  },
  {
    id: "audit-103",
    timestamp: "2026-07-24 09:12:05",
    actor: "Developer (李工)",
    action: "AGENT_CONFIG_UPDATE",
    target: "主控 Agent 系统 Prompt 改写",
    department: "AI 平台组",
    ip: "10.20.14.55",
    result: "SUCCESS",
  },
];

export const SettingsPage: React.FC = () => {
  const { environment, setEnvironment } = useAppStore();
  const [activeTab, setActiveTab] = useState<"openapi" | "credentials" | "audit" | "environment">("openapi");

  const [endpoints] = useState<OpenApiEndpoint[]>(defaultEndpoints);
  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenApiEndpoint>(defaultEndpoints[0]);
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
    }, 500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>平台管理与 OpenAPI 网关 (Platform & Management)</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1 font-sans">
          配置多环境隔离、查看 OpenAPI RESTful 网关、安全凭证库与全平台操作审计 Trace。
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("openapi")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === "openapi"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-white/10"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>OpenAPI 网关</span>
        </button>

        <button
          onClick={() => setActiveTab("credentials")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === "credentials"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-white/10"
          }`}
        >
          <Key className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>凭证保管库 (Secrets)</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-white/10"
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>全平台审计日志 (Audit Trace)</span>
        </button>

        <button
          onClick={() => setActiveTab("environment")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === "environment"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-white/10"
          }`}
        >
          <Server className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span>环境管理 (Environment)</span>
        </button>
      </div>

      {/* OpenAPI Tab */}
      {activeTab === "openapi" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="font-bold text-xs sm:text-sm font-mono text-neutral-700 dark:text-slate-300">开放 API 接口目录 ({endpoints.length})</h3>
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setTestResponse(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer space-y-1.5 transition-all ${
                  selectedEndpoint?.id === ep.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 font-bold text-blue-900 dark:text-blue-300 shadow-xs"
                    : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] text-neutral-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-mono text-xs font-bold">
                    {ep.method}
                  </span>
                  <span className="text-neutral-900 dark:text-slate-200 text-xs sm:text-sm font-mono truncate">{ep.path}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-slate-400 line-clamp-1 font-sans">{ep.name}</p>
              </div>
            ))}
          </div>

          {/* Selected API Interactive Test Console */}
          <div className="lg:col-span-2 space-y-4 p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-slate-100">{selectedEndpoint?.name}</h3>
                <span className="text-xs sm:text-sm font-mono text-blue-700 dark:text-blue-400 font-semibold">
                  {selectedEndpoint?.method} {selectedEndpoint?.path}
                </span>
              </div>

              <button
                onClick={() => handleCopy(selectedEndpoint?.sampleRequest || "")}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/5 font-mono text-xs sm:text-sm flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "已复制 Payload" : "复制 Payload"}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 leading-relaxed font-sans">{selectedEndpoint?.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-mono">
              <div>
                <div className="flex items-center min-h-[32px] mb-1">
                  <label className="text-neutral-800 dark:text-slate-300 font-bold font-mono truncate">示例 Request JSON Payload</label>
                </div>
                <pre className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-blue-300 overflow-x-auto h-48 text-xs leading-relaxed">
                  {selectedEndpoint?.sampleRequest}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 min-h-[32px] mb-1">
                  <label className="text-neutral-800 dark:text-slate-300 font-bold font-mono truncate">测试运行与 Response</label>
                  <button
                    onClick={handleRunApiTest}
                    disabled={isTesting}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm shrink-0 whitespace-nowrap"
                  >
                    <Play className="w-3 h-3 shrink-0" />
                    <span>{isTesting ? "请求中..." : "测试发起 HTTP 请求"}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-emerald-400 overflow-x-auto h-48 text-xs leading-relaxed">
                  {testResponse || "// 点击“测试发起 HTTP 请求”进行在线联调"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === "credentials" && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>凭证与 Key 安全保管库 (Credential Safe)</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-0.5 font-sans">
                严禁前端直接存储明文 API Key/密码。前端仅传递 `credentialId`，具体解密与请求代理在服务端完成。
              </p>
            </div>
            <button className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm font-mono shadow-md">
              + 录入新凭证
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs sm:text-sm">
            {mockCredentials.map((cred) => (
              <div
                key={cred.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/50 space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-neutral-900 dark:text-slate-100">{cred.name}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-500/30">
                      ID: {cred.id}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-slate-400">{cred.type}</p>
                  <p className="text-xs text-neutral-500 dark:text-slate-500">{cred.maskedSecret}</p>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-neutral-600 dark:text-slate-400 text-xs">
                  <span>被 {cred.usedByCount} 个组件使用</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ {cred.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl space-y-4">
          <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
            <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>全平台安全与写操作审计日志 (Audit Trace Logs)</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-0.5 font-sans">
              可追溯所有人工审批、模型高危指令拦截、数据库写操作与 Agent 配置修改。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-slate-400 bg-neutral-50 dark:bg-white/5 font-bold">
                  <th className="p-3">时间</th>
                  <th className="p-3">操作主体 (Actor)</th>
                  <th className="p-3">动作 (Action)</th>
                  <th className="p-3">目标资源 (Target)</th>
                  <th className="p-3">部门</th>
                  <th className="p-3">IP 地址</th>
                  <th className="p-3">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 text-neutral-500 dark:text-slate-400">{log.timestamp}</td>
                    <td className="p-3 font-bold text-neutral-900 dark:text-slate-200">{log.actor}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-800 dark:text-slate-300">{log.target}</td>
                    <td className="p-3 text-neutral-500 dark:text-slate-400">{log.department}</td>
                    <td className="p-3 text-neutral-500 dark:text-slate-500">{log.ip}</td>
                    <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">{log.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Environment Tab */}
      {activeTab === "environment" && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl space-y-6">
          <div className="border-b border-neutral-200 dark:border-white/10 pb-3">
            <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
              <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>多环境隔离与切换 (Environment Settings)</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-0.5 font-sans">
              支持 Development (开发/沙盒)、Staging (测试/集成) 和 Production (生产物理) 环境隔离。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                id: "dev",
                name: "Development (开发环境)",
                desc: "自动加载 Mock 仿真数据源与沙盒引擎，安全允许开发者自由调试。",
                color: "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300",
              },
              {
                id: "staging",
                name: "Staging (测试/预发布)",
                desc: "连接企业测试网段数据库，用于自动化基准测试与完整 DAG 流程联调。",
                color: "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-300",
              },
              {
                id: "prod",
                name: "Production (生产环境)",
                desc: "连接 IPMS 核心物理网关与真实 Vector DB，写指令强制必须触发人工审批。",
                color: "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300",
              },
            ].map((env) => {
              const isSelected = environment === env.id;
              return (
                <div
                  key={env.id}
                  onClick={() => setEnvironment(env.id as AppEnvironment)}
                  className={`p-5 rounded-2xl border cursor-pointer space-y-3 transition-all ${
                    isSelected
                      ? env.color + " shadow-lg font-bold"
                      : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/40 text-neutral-600 dark:text-slate-400 hover:border-neutral-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100">{env.name}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-neutral-200 dark:bg-white/10 text-neutral-800 dark:text-slate-200">
                        当前环境
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 leading-relaxed font-sans">{env.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
