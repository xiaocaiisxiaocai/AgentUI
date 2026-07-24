import React from "react";
import {
  X,
  FileText,
  Layers,
  Cpu,
  Wrench,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Database,
  Search,
  Sparkles,
  Bot
} from "lucide-react";
import { Citation, ExecutionStep, RunTraceStep, ViewMode, AppLanguage } from "../types";

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "context" | "sources" | "agents" | "tools" | "trace";
  setActiveTab: (tab: "context" | "sources" | "agents" | "tools" | "trace") => void;
  selectedCitation?: Citation | null;
  citations: Citation[];
  executionSteps: ExecutionStep[];
  currentAgentName: string;
  department: string;
  workspace: string;
  viewMode: ViewMode;
  lang: AppLanguage;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  selectedCitation,
  citations,
  executionSteps,
  currentAgentName,
  department,
  workspace,
  viewMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 sm:w-96 border-l border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] flex flex-col h-full shadow-xl transition-all z-30 shrink-0">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#121215]">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100">
            上下文与执行 Inspector
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#08080a] text-[11px] font-mono px-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("context")}
          className={`py-2 px-2.5 border-b-2 font-bold whitespace-nowrap transition-colors ${
            activeTab === "context"
              ? "border-blue-500 text-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          上下文 (Context)
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`py-2 px-2.5 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center space-x-1 ${
            activeTab === "sources"
              ? "border-blue-500 text-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>来源 ({citations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`py-2 px-2.5 border-b-2 font-bold whitespace-nowrap transition-colors ${
            activeTab === "agents"
              ? "border-blue-500 text-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Agent 拓扑
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`py-2 px-2.5 border-b-2 font-bold whitespace-nowrap transition-colors ${
            activeTab === "tools"
              ? "border-blue-500 text-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          工具
        </button>
        <button
          onClick={() => setActiveTab("trace")}
          className={`py-2 px-2.5 border-b-2 font-bold whitespace-nowrap transition-colors ${
            activeTab === "trace"
              ? "border-blue-500 text-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          轨迹
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: Context */}
        {activeTab === "context" && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-2">
              <div className="font-bold text-blue-400 flex items-center space-x-1.5">
                <Bot className="w-4 h-4" />
                <span>当前活跃 Agent 环境</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="text-slate-400">Agent 名称:</div>
                <div className="font-mono text-slate-200 font-bold">{currentAgentName}</div>
                <div className="text-slate-400">所属部门:</div>
                <div className="font-mono text-slate-200">{department}</div>
                <div className="text-slate-400">当前工作空间:</div>
                <div className="font-mono text-slate-200">{workspace}</div>
                <div className="text-slate-400">模式:</div>
                <div className="font-mono text-emerald-400 font-bold">
                  {viewMode === "expert" ? "专家模式 (Expert)" : "业务模式 (Business)"}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] space-y-2">
              <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>会话上下文记忆 (Context Memory)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                当前 Task Session 维度自动维持：包含上次查询的设备型号 (AOI-03)、历史故障代码 (504_GW_TIMEOUT) 及部门数据库隔离 Namespace。
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Sources / Citations */}
        {activeTab === "sources" && (
          <div className="space-y-3">
            {selectedCitation && (
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 space-y-2">
                <div className="flex items-center justify-between text-blue-400 font-bold">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>高亮选中的引用来源</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20">
                    匹配度: {(selectedCitation.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="font-bold text-slate-200">{selectedCitation.docTitle}</p>
                <p className="text-slate-400 text-[11px]">定位: {selectedCitation.section} {selectedCitation.page ? `(第 ${selectedCitation.page} 页)` : ""}</p>
                <div className="p-2.5 rounded bg-neutral-900 border border-white/5 font-mono text-[11px] text-slate-300 leading-relaxed">
                  "{selectedCitation.excerpt}"
                </div>
              </div>
            )}

            <div className="font-bold text-slate-300 flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>所有关联知识来源 ({citations.length})</span>
            </div>

            {citations.map((cit, idx) => (
              <div
                key={cit.id || idx}
                className="p-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] space-y-1.5 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                    [{idx + 1}] {cit.sourceType || "DOC"}
                  </span>
                  <span className="text-slate-400">相似度: {(cit.similarity * 100).toFixed(0)}%</span>
                </div>
                <div className="font-bold text-slate-200">{cit.docTitle}</div>
                <div className="text-[11px] text-slate-400">{cit.section}</div>
                <div className="p-2 rounded bg-neutral-900/60 font-mono text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                  {cit.excerpt}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Agent Topology */}
        {activeTab === "agents" && (
          <div className="space-y-4">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>多 Agent 任务分发拓扑 (Multi-Agent Cascade)</span>
            </div>

            <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 space-y-3">
              <div className="flex items-center space-x-2 border-b border-purple-500/20 pb-2">
                <div className="w-7 h-7 rounded bg-purple-600/20 border border-purple-500 text-purple-300 flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <div className="font-bold text-purple-300">总控 Agent (Supervisor)</div>
                  <div className="text-[10px] text-slate-400">状态: 调度完成 | 耗时 120ms</div>
                </div>
              </div>

              <div className="pl-4 border-l-2 border-purple-500/30 space-y-2.5">
                <div className="p-2 rounded bg-neutral-900 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200">1. IPMS 历史检索 Agent</span>
                    <span className="text-emerald-400 font-mono text-[10px]">SUCCESS (380ms)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">提取到 2 条同类型 504 故障复原规程</p>
                </div>

                <div className="p-2 rounded bg-neutral-900 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200">2. 工单生成与审批 Agent</span>
                    <span className="text-amber-400 font-mono text-[10px]">WAITING_APPROVAL</span>
                  </div>
                  <p className="text-[10px] text-slate-400">准备向 IPMS 提交特急维修单，挂起等待确认</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Tools */}
        {activeTab === "tools" && (
          <div className="space-y-3">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>本轮调用工具集 (Executed Tools)</span>
            </div>

            {executionSteps.map((step) => (
              <div key={step.id} className="p-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{step.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    step.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{step.detail}</p>
                {step.toolInput && (
                  <pre className="p-2 rounded bg-neutral-900 font-mono text-[10px] text-blue-300 overflow-x-auto">
                    Input: {JSON.stringify(step.toolInput, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: Trace */}
        {activeTab === "trace" && (
          <div className="space-y-3">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>全链路 Run Trace 时间线</span>
            </div>

            <div className="relative pl-4 space-y-3 border-l border-neutral-200 dark:border-white/10">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                <div className="font-bold text-slate-200 text-[11px]">1. 意图解析 (Intent Parsing)</div>
                <div className="text-[10px] text-slate-400">120ms - 识别设备故障排查与开单请求</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500" />
                <div className="font-bold text-slate-200 text-[11px]">2. IPMS 案例向量召回</div>
                <div className="text-[10px] text-slate-400">380ms - 命中文档 §3.2 (Score 0.96)</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="font-bold text-slate-200 text-[11px]">3. 构造 IPMS 工单 Schema</div>
                <div className="text-[10px] text-slate-400">180ms - tool-ticket-create</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="font-bold text-slate-200 text-[11px]">4. 人工确认卡片就绪</div>
                <div className="text-[10px] text-slate-400">Waiting User Action</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
