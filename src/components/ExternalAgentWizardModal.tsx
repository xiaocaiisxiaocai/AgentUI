import React, { useState } from "react";
import {
  X,
  Globe,
  CheckCircle2,
  Sparkles,
  Play,
  ArrowRight,
  ArrowLeft,
  Code2,
  Clock,
  RotateCcw,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { AgentDefinition } from "../types";
import { apiService } from "../services/apiService";

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

  // P1 External Agent Wizard required fields
  const [inputSchema, setInputSchema] = useState(
    JSON.stringify({ query: "string", department: "string", maxResults: 5 }, null, 2)
  );
  const [outputSchema, setOutputSchema] = useState(
    JSON.stringify({ responseText: "string", citations: "array", confidenceScore: "number" }, null, 2)
  );
  const [capabilities, setCapabilities] = useState<string[]>(["IPMS_Query", "PLC_Log_Fetcher"]);
  const [newCapability, setNewCapability] = useState("");
  const [timeoutMs, setTimeoutMs] = useState<number>(5000);
  const [retryCount, setRetryCount] = useState<number>(3);
  const [fallbackBehavior, setFallbackBehavior] = useState<"default_llm" | "circuit_breaker" | "human_escalate">(
    "default_llm"
  );

  // Step 4 Verification State
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    statusCode?: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleAddCapability = () => {
    if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
      setCapabilities([...capabilities, newCapability.trim()]);
      setNewCapability("");
    }
  };

  const handleRemoveCapability = (cap: string) => {
    setCapabilities(capabilities.filter((c) => c !== cap));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await apiService.testExternalAgent(endpoint, authType, "cred_sec_7891");
    setIsTesting(false);
    setTestResult(result);
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
      healthStatus: testResult?.success ? "Healthy" : "Degraded",
      latencyMs: testResult?.latencyMs || 280,
      successRate: 98.5,
      totalRuns: 1,
      lastRunTime: "刚刚",
      isExternal: true,
      // Wizard configs
      inputSchema,
      outputSchema,
      capabilities,
      timeoutMs,
      retryCount,
      fallbackBehavior,
      credentialId: "cred_ext_sec_" + Date.now().toString().slice(-4),
      maskedSecret: "sk_live_****" + (apiKey ? apiKey.slice(-4) : "8A2F"),
      dataSourceType: "LIVE",
    };

    addAgent(newAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#111115]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">外部 Agent 多步骤接入向导</h2>
              <p className="text-xs text-slate-400">配置第三方 Agent 协议 (A2A, MCP, Dify, HTTP) 及治理规则</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="p-4 bg-neutral-900 border-b border-white/10 grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className={`p-2 rounded-lg border ${step === 1 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            1. 协议与基本元数据
          </div>
          <div className={`p-2 rounded-lg border ${step === 2 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            2. Endpoint 与脱敏凭证
          </div>
          <div className={`p-2 rounded-lg border ${step === 3 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            3. Schema 与熔断策略
          </div>
          <div className={`p-2 rounded-lg border ${step === 4 ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold" : "border-white/5 text-slate-500"}`}>
            4. 测试连接与发布
          </div>
        </div>

        {/* Wizard Step Form Body */}
        <div className="p-6 space-y-4 text-xs flex-1 overflow-y-auto">
          {/* STEP 1: PROTOCOL & BASIC META */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-slate-300 font-bold font-mono">选择跨系统 Agent 通信协议</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "A2A", name: "Agent-to-Agent (A2A)", desc: "Google A2A 协议" },
                  { id: "MCP", name: "Model Context Protocol", desc: "Anthropic MCP" },
                  { id: "Dify", name: "Dify Agent API", desc: "Dify 工作流引擎" },
                  { id: "LangGraph", name: "LangGraph Cloud", desc: "LangChain 状态图" },
                  { id: "OpenAI", name: "OpenAI Assistants", desc: "OpenAI Threads API" },
                  { id: "HTTP", name: "Custom REST / SSE", desc: "标准 HTTP POST" },
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
                    placeholder="例如: Dify 厂区排产 Agent"
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
                  placeholder="说明此外部 Agent 承担的跨域业务场景..."
                  className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ENDPOINT & AUTH CREDENTIALS */}
          {step === 2 && (
            <div className="space-y-4 font-mono">
              <div>
                <label className="block text-slate-400 mb-1">远程 Agent Endpoint URL *</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-purple-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">鉴权方式 (Auth Type)</label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                  >
                    <option value="None">None (公开测试)</option>
                    <option value="Bearer">Bearer Token</option>
                    <option value="APIKey">X-API-Key Header</option>
                    <option value="OAuth2">OAuth2 Client Credentials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">秘钥口令 (脱敏保存)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] space-y-1">
                <span className="font-bold">🔒 凭证安全规范 (P3 Security):</span>
                <p>密钥不会直接保存在前端 Store，仅分配 Credential ID (`cred_ext_sec_9081`)，敏感凭证展示值将自动脱敏为 `sk_live_****8A2F`。</p>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEMAS, TIMEOUT, RETRY, FALLBACK */}
          {step === 3 && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Input Schema (JSON)</label>
                  <textarea
                    rows={4}
                    value={inputSchema}
                    onChange={(e) => setInputSchema(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-emerald-300 text-[11px] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Output Schema (JSON)</label>
                  <textarea
                    rows={4}
                    value={outputSchema}
                    onChange={(e) => setOutputSchema(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-emerald-300 text-[11px] font-mono"
                  />
                </div>
              </div>

              {/* Capability tags */}
              <div>
                <label className="block text-slate-400 mb-1">Capabilities 业务能力标签</label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    placeholder="输入能力 (如: execute_sql) 按 Enter 添加"
                    className="flex-1 p-2 rounded-lg bg-black border border-white/10 text-slate-100"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCapability())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCapability}
                    className="px-3 py-2 rounded-lg bg-purple-600 text-white font-bold"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]"
                    >
                      <span>{cap}</span>
                      <button onClick={() => handleRemoveCapability(cap)} className="hover:text-white font-bold ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Timeout, Retry, Fallback */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 mb-1">Timeout 超时 (ms)</label>
                  <input
                    type="number"
                    value={timeoutMs}
                    onChange={(e) => setTimeoutMs(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Retry 重试次数</label>
                  <input
                    type="number"
                    value={retryCount}
                    onChange={(e) => setRetryCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Fallback 降级策略</label>
                  <select
                    value={fallbackBehavior}
                    onChange={(e) => setFallbackBehavior(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-slate-100"
                  >
                    <option value="default_llm">切回默认 LLM 回复</option>
                    <option value="circuit_breaker">触发熔断阻断请求</option>
                    <option value="human_escalate">转接人工待办核准</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: HEALTH CHECK & FINISH */}
          {step === 4 && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-xl border border-white/10 bg-black space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">测试远程 Endpoint 连通性</span>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>{isTesting ? "测试连通性中..." : "测试连接 (Ping)"}</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs leading-relaxed ${
                      testResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <div className="font-bold font-mono">
                      {testResult.success ? "✅ 握手成功 (HTTP 200 OK)" : "❌ 握手失败"}
                    </div>
                    <div>{testResult.message}</div>
                    <div className="text-[10px] opacity-75 mt-1">耗时: {testResult.latencyMs} ms</div>
                  </div>
                )}
              </div>
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
              <span>完成接入并注册 Agent</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
