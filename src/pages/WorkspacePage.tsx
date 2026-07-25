import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Paperclip,
  Database,
  Wrench,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Terminal,
  Activity,
  Copy,
  Check,
  ShieldAlert,
  Search,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import {
  AgentDefinition,
  ChatMessage,
  Citation,
  ExecutionStep,
  ViewMode,
  AppLanguage,
  ApprovalRequest
} from "../types";

interface WorkspacePageProps {
  agents: AgentDefinition[];
  currentAgentId: string;
  onSelectAgent: (id: string) => void;
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isGenerating: boolean;
  onOpenCitation: (citation: Citation) => void;
  onOpenApproval: (request: ApprovalRequest) => void;
  viewMode: ViewMode;
  lang: AppLanguage;
  department: string;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  agents,
  currentAgentId,
  onSelectAgent,
  messages,
  onSendMessage,
  isGenerating,
  onOpenCitation,
  onOpenApproval,
  viewMode,
  department,
}) => {
  const [inputQuery, setInputQuery] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showCapabilitySelector, setShowCapabilitySelector] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeAgent = agents.find((a) => a.id === currentAgentId) || agents[0];

  const quickPrompts = [
    "🛠️ 客户现场设备 PLC 504 Gateway Timeout 网关超时排查与复原 CheckList",
    "📊 跨表格 XLOOKUP 多条件数据匹配公式与运营助理处理要点",
    "📝 现场以太网卡双工模式不匹配导致的间歇性掉线事故复盘",
    "✉️ 生成向客户提交正式故障诊断报告的沟通邮件"
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;
    onSendMessage(inputQuery.trim());
    setInputQuery("");
  };

  const handleCopyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50 dark:bg-[#050505]">
      {/* Top Agent Active Banner */}
      <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowAgentDropdown(!showAgentDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] hover:border-blue-500/40 transition-all text-xs font-bold text-slate-100"
            >
              <div className="w-5 h-5 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="truncate max-w-[180px]">{activeAgent.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showAgentDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 font-bold border-b border-white/5">
                  切换对话 Agent
                </div>
                {agents.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => {
                      onSelectAgent(ag.id);
                      setShowAgentDropdown(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                      ag.id === currentAgentId
                        ? "bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{ag.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{ag.type} | {ag.department}</span>
                    </div>
                    {ag.id === currentAgentId && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              {activeAgent.type}
            </span>
            <span>模型: <strong className="text-slate-200">{activeAgent.model}</strong></span>
            <span>知识库: <strong className="text-slate-200">{activeAgent.knowledgeBaseIds.length} 个</strong></span>
            <span>工具: <strong className="text-slate-200">{activeAgent.toolIds.length} 个</strong></span>
          </div>
        </div>

        {/* Capability Shortcuts */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCapabilitySelector(!showCapabilitySelector)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-mono flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>资源绑定选择器</span>
          </button>
        </div>
      </div>

      {/* Resource Capability Modal */}
      {showCapabilitySelector && (
        <div className="p-3 bg-neutral-900 border-b border-white/10 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span>当前 Agent 已优选绑定的企业级资源:</span>
            <button onClick={() => setShowCapabilitySelector(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              知识库: IPMS 历史故障案例库 (kb-ipms-history)
            </span>
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              工具: IPMS 历史问题 SQL 查询 (tool-ipms-query)
            </span>
            <span className="px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/20">
              工具: 工单提交写接口 (需人工确认)
            </span>
          </div>
        </div>
      )}

      {/* Dual Stream Chat Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Stream: Chat Timeline */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}
                >
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-slate-300">{isUser ? "您 (User)" : activeAgent.name}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-xs shadow-md font-sans"
                        : "bg-white dark:bg-[#121215] text-slate-900 dark:text-slate-100 border border-neutral-200 dark:border-white/10 rounded-tl-xs shadow-sm space-y-3"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Citations Badges */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-neutral-100 dark:border-white/10 space-y-1.5">
                        <div className="text-[10px] font-mono text-slate-400 font-bold flex items-center space-x-1">
                          <Database className="w-3 h-3 text-blue-400" />
                          <span>相关知识库来源 (可点击可验证):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.citations.map((cit, cIdx) => (
                            <button
                              key={cit.id || cIdx}
                              onClick={() => onOpenCitation(cit)}
                              className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold flex items-center space-x-1 transition-colors"
                            >
                              <span>[{cIdx + 1}] {cit.docTitle}</span>
                              <span className="text-[9px] opacity-75">({(cit.similarity * 100).toFixed(0)}%)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Multi-Agent Execution Steps Card */}
                    {!isUser && msg.steps && msg.steps.length > 0 && (
                      <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 space-y-2 font-mono text-[11px]">
                        <div className="text-purple-300 font-bold flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <Layers className="w-3.5 h-3.5 text-purple-400" />
                            <span>多 Agent / 工具调度轨迹</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Total Steps: {msg.steps.length}</span>
                        </div>
                        {msg.steps.map((st) => (
                          <div key={st.id} className="flex items-center justify-between text-slate-300">
                            <span>{st.name}</span>
                            {st.status === "waiting_approval" ? (
                              <button
                                onClick={() =>
                                  onOpenApproval({
                                    id: "req-101",
                                    agentId: activeAgent.id,
                                    agentName: activeAgent.name,
                                    actionType: "IPMS 写入工单",
                                    actionTitle: "提交 IPMS 紧急维修工单",
                                    description: "向 IPMS 系统物理写接口提交 PLC 网关复位紧急工单",
                                    riskLevel: "high",
                                    status: "pending",
                                    timestamp: "09:14:10",
                                    params: { deviceId: "PLC-504-GW", ip: "192.168.10.100" },
                                  })
                                }
                                className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition-colors"
                              >
                                ⚠️ 待审批 (点击前往)
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-[10px]">{st.status}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 max-w-xs animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>Agent 正在检索知识库与生成推理...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 border-t border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-[#08080a] overflow-x-auto flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">快捷测试:</span>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setInputQuery(p)}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] hover:border-blue-500/40 text-[11px] text-slate-300 shrink-0 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b] shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="输入问题或提示词... (提示: 可输入 @Agent, #知识库 或 /工具)"
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isGenerating}
                className="absolute right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
