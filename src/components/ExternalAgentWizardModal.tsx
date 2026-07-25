import React, { useState } from "react";
import {
  X,
  Bot,
  Globe,
  Key,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Play,
  ArrowRight,
  ArrowLeft,
  FileCode,
  Layers,
  Activity
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { AgentDefinition } from "../types";

interface ExternalAgentWizardModalProps {
  onClose: () => void;
}

export const ExternalAgentWizardModal: React.FC<ExternalAgentWizardModalProps> = ({ onClose }) => {
  const { addAgent } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Data
  const [protocol, setProtocol] = useState<"A2A" | "MCP" | "Dify" | "LangGraph" | "OpenAI" | "HTTP">("A2A");
  const [agentName, setAgentName] = useState("");
  const [department, setDepartment] = useState("售后技术部");
  const [description, setDescription] = useState("");
  const [endpoint, setEndpoint] = useState("https://external-agent.partner-service.org/v1/a2a");
  const [authType, setAuthType] = useState<"None" | "APIKey" | "Bearer" | "OAuth2">("Bearer");
  const [apiKey, setApiKey] = useState("ak_ext_a2a_sec_90812");

  // Step 3 Schema Test State
  const [discoveredCapabilities, setDiscoveredCapabilities] = useState<{
    tools: string[];
    models: string[];
    supportsStreaming: boolean;
  } | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Step 4 Verification State
  const [testLog, setTestLog] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleDiscover = () => {
    setIsDiscovering(true);
    setTimeout(() => {
      setIsDiscovering(false);
      setDiscoveredCapabilities({
        tools: ["IPMS_Fault_Query", "PLC_Log_Fetcher", "Ticket_Auto_Filler"],
        models: ["gpt-4o", "claude-3-5-sonnet", "deepseek-r1"],
        supportsStreaming: true,
      });
    }, 800);
  };

  const handlePingTest = () => {
    setIsTesting(true);
    setTestLog(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestLog(
        JSON.stringify(
          {
            status: "HEALTHY",
            protocol,
            latencyMs: 128,
            handshake: "A2A_PROTOCOL_V2_ACK",
            remoteAgentVersion: "v2.4.0",
            capabilities: ["streaming", "function_calling", "human_approval"]
          },
          null,
          2
        )
      );
    }, 700);
  };

  const handleComplete = () => {
    if (!agentName.trim()) return;

    const newAgent: AgentDefinition = {
      id: "agent-ext-" + Date.now(),
      name: agentName.trim(),
      description: description || `外部第三方 ${protocol} 协议接入 Agent`,
      icon: "Globe",
      type: "External",
      department,
      status: "active",
      version: "v1.0",
      model: `${protocol} Remote Model`,
      systemPrompt: "外部代理按协议透传通信",
      planningMode: "react",
      knowledgeBaseIds: [],
      toolIds: [],
      childAgentIds: [],
      connectorIds: [],
      workflowIds: [],
      protocolType: protocol as any,
      endpoint,
      authType,
      healthStatus: "Healthy",
      latencyMs: 128,
      successRate: 99.2,
      totalRuns: 1,
      lastRunTime: "刚刚",
      isExternal: true,
    };

    addAgent(newAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#111115]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">外部 Agent 多步骤接入向导 (External Agent Wizard)</h2>
              <p className="text-xs text-slate-400">跨机构 / 第三方 Agent 协议接入 (A2A, MCP, Dify, LangGraph, OpenAI)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="p-4 bg-neutral-900 border-b border-white/10 grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className={`p-2 rounded-lg border ${step === 1 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            1. 协议选择
          </div>
          <div className={`p-2 rounded-lg border ${step === 2 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            2. 端点与鉴权
          </div>
          <div className={`p-2 rounded-lg border ${step === 3 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            3. Schema 自动发现
          </div>
          <div className={`p-2 rounded-lg border ${step === 4 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            4. 握手与发布
          </div>
        </div>

        {/* Wizard Step Form Body */}
        <div className="p-6 space-y-4 text-xs flex-1">
          {/* STEP 1: PROTOCOL & BASIC META */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-slate-300 font-bold">选择跨系统 Agent 通信协议</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "A2A", name: "Agent-to-Agent (A2A)", desc: "Google/Open Standard 架构" },
                  { id: "MCP", name: "Model Context Protocol", desc: "Anthropic MCP 工具与上下文" },
                  { id: "Dify", name: "Dify Agent API", desc: "Dify 工作流与 Agent 编排" },
                  { id: "LangGraph", name: "LangGraph Cloud", desc: "LangChain 状态图代理" },
                  { id: "OpenAI", name: "OpenAI Assistants API", desc: "OpenAI Assistant Threads" },
                  { id: "HTTP", name: "Custom REST / SSE", desc: "标准 HTTP POST 结构体" },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setProtocol(p.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer space-y-1 transition-all ${
                      protocol === p.id
                        ? "border-purple-500 bg-purple-500/10 font-bold text-purple-300 shadow-md"
                        : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0f0f12] text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <span className="block text-xs text-slate-200 font-bold">{p.name}</span>
                    <p className="text-[10px] text-slate-400">{p.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Agent 名称 *</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="例如: 智能售后 Diagnostic Agent (A2A)"
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">归属部门</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                  >
                    <option value="售后技术部">售后技术部</option>
                    <option value="运营助理部">运营助理部</option>
                    <option value="通用行政部">通用行政部</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">功能描述</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简单说明此外部 Agent 承担的业务场景..."
                  className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ENDPOINT & AUTH */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">远程 Agent Endpoint URL *</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-purple-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">鉴权方式 (Auth Type)</label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100 font-mono"
                  >
                    <option value="None">None (公开测试)</option>
                    <option value="Bearer">Bearer Token Authorization</option>
                    <option value="APIKey">X-API-Key Header</option>
                    <option value="OAuth2">OAuth2 Client Credentials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">密钥 / API Key Payload</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEMA AUTO-DISCOVERY */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-black space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 font-mono">能力探针 (Capabilities & Tool Discovery)</span>
                  <button
                    onClick={handleDiscover}
                    disabled={isDiscovering}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isDiscovering ? "自动探测中..." : "发起 Schema 自动探测"}</span>
                  </button>
                </div>

                {discoveredCapabilities ? (
                  <div className="space-y-2 text-[11px] font-mono text-emerald-400">
                    <p className="text-slate-300">✅ 探针成功！解析获取到远端支持的工具与模型：</p>
                    <div className="flex flex-wrap gap-2">
                      {discoveredCapabilities.tools.map((t) => (
                        <span key={t} className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Tool: {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 font-mono text-[11px]">点击上方按钮自动向 Endpoint 发起 OPTIONS / GET Schema 探针解析。</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: HEALTH CHECK & FINISH */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 font-mono">双向 PING / ACK 连通性测试</span>
                <button
                  onClick={handlePingTest}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono flex items-center space-x-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isTesting ? "握手中..." : "测试连接 ACK"}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-black border border-white/10 text-emerald-400 font-mono text-[11px] h-40 overflow-y-auto">
                {testLog || "// 点击“测试连接 ACK”进行实时握手验证"}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Wizard Navigation Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-white/10 bg-neutral-900 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as any) : s))}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 flex items-center space-x-1 font-mono text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>上一步</span>
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s < 4 ? ((s + 1) as any) : s))}
              disabled={step === 1 && !agentName.trim()}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold flex items-center space-x-1 font-mono text-xs"
            >
              <span>下一步</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!agentName.trim()}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center space-x-1 font-mono text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>完成接入并注册</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
