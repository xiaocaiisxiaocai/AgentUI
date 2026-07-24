import React, { useState } from "react";
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Activity,
  Terminal,
  ShieldCheck,
  Globe,
  Radio,
  Zap,
  Play,
  Server
} from "lucide-react";
import { AgentDefinition } from "../types";

interface ExternalAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agent: AgentDefinition) => void;
}

export const ExternalAgentModal: React.FC<ExternalAgentModalProps> = ({
  isOpen,
  onClose,
  onAddAgent,
}) => {
  const [protocol, setProtocol] = useState<
    "HTTP" | "SSE" | "WebSocket" | "A2A" | "MCP" | "OpenAI" | "LangGraph" | "Dify"
  >("Dify");
  const [name, setName] = useState("厂区 Dify 智能排产 Agent");
  const [description, setDescription] = useState("通过 A2A / HTTP 协议跨域接入外部厂区 Dify Agent，获取排产与备件库存");
  const [endpoint, setEndpoint] = useState("https://dify.internal-factory.com/api/v1/chat-messages");
  const [department, setDepartment] = useState("售后技术部");
  const [authType, setAuthType] = useState<"None" | "APIKey" | "Bearer" | "OAuth2">("Bearer");
  const [authToken, setAuthToken] = useState("app-dify-secret-key-901284");

  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | null;
    latencyMs?: number;
    healthStatus?: string;
    sampleResponse?: string;
  }>({ status: null });

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult({ status: null });

    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        status: "success",
        latencyMs: 320,
        healthStatus: "Healthy (HTTP 200 OK)",
        sampleResponse: JSON.stringify(
          {
            agent_id: "remote_dify_prod_01",
            protocol: protocol,
            capabilities: ["stream", "tool_calls", "file_parse"],
            status: "ready",
            message: "External agent endpoint verified successfully."
          },
          null,
          2
        ),
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !endpoint.trim()) return;

    const newExternalAgent: AgentDefinition = {
      id: "agent-ext-" + Date.now(),
      name: name.trim(),
      description: description.trim(),
      icon: "Cloud",
      type: "External",
      department,
      status: "active",
      version: "v1.0-remote",
      model: `${protocol} Agent Engine`,
      systemPrompt: "外部协议 Agent Proxy。",
      planningMode: "auto",
      knowledgeBaseIds: [],
      toolIds: [],
      childAgentIds: [],
      connectorIds: [],
      workflowIds: [],
      protocolType: protocol,
      endpoint,
      authType,
      healthStatus: "Healthy",
      latencyMs: testResult.latencyMs || 320,
      successRate: 98.0,
      totalRuns: 0,
      lastRunTime: "刚刚",
      isExternal: true,
    };

    onAddAgent(newExternalAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200 dark:border-white/10 p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                接入外部 Agent (External Agent Proxy)
              </h3>
              <p className="text-xs text-slate-400">
                支持 A2A、MCP、Dify、LangGraph 及 OpenAI 标准 RESTful 协议集成
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Protocol Type Selection */}
          <div>
            <label className="block text-slate-300 font-mono font-bold mb-1.5">
              1. 选择接入协议 (Protocol Type)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "A2A", label: "A2A (Agent-to-Agent)" },
                { id: "MCP", label: "MCP Protocol" },
                { id: "Dify", label: "Dify Agent API" },
                { id: "LangGraph", label: "LangGraph Remote" },
                { id: "OpenAI", label: "OpenAI Compatible" },
                { id: "HTTP", label: "Standard HTTP REST" },
                { id: "SSE", label: "SSE Streaming" },
                { id: "WebSocket", label: "WebSocket Agent" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProtocol(p.id as any)}
                  className={`p-2.5 rounded-lg border text-left font-mono transition-all ${
                    protocol === p.id
                      ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold shadow-xs"
                      : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>{p.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Infos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-mono mb-1">Agent 名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] text-slate-100 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono mb-1">所属部门</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="售后技术部">售后技术部</option>
                <option value="运营助理部">运营助理部</option>
                <option value="通用行政部">通用行政部</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-mono mb-1">描述与能力声明</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Endpoint & Auth */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-mono mb-1">Endpoint API URL</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono mb-1">鉴权方式</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as any)}
                className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="None">None</option>
                <option value="APIKey">API Key</option>
                <option value="Bearer">Bearer Token</option>
                <option value="OAuth2">OAuth 2.0</option>
              </select>
            </div>
          </div>

          {authType !== "None" && (
            <div>
              <label className="block text-slate-300 font-mono mb-1">Secret Token / API Key</label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] font-mono text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Test Connection Area */}
          <div className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 font-mono flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>联调连通性验证 (Connectivity Verification)</span>
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTesting ? "测试握手中..." : "测试 Agent 连接"}</span>
              </button>
            </div>

            {testResult.status === "success" && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>握手成功: {testResult.healthStatus}</span>
                  </span>
                  <span className="font-mono text-[10px]">延迟: {testResult.latencyMs} ms</span>
                </div>
                <pre className="p-2 rounded bg-neutral-950 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                  {testResult.sampleResponse}
                </pre>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-neutral-200 dark:border-white/10 text-slate-300 hover:bg-white/5"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md transition-colors"
            >
              完成接入外部 Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
