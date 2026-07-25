import React from "react";
import {
  X,
  FileText,
  Activity,
  GitBranch,
  Bot,
  Wrench,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Citation, ExecutionStep } from "../types";
import { DataSourceBadge } from "./Badge";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export const InspectorPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    isInspectorOpen,
    setIsInspectorOpen,
    inspectorTab,
    setInspectorTab,
    activeMessageId,
    sessions,
    activeSessionId,
    agents,
    tools,
    knowledgeBases,
    setSelectedCitation,
    lang,
  } = useAppStore();

  if (!isInspectorOpen) return null;

  // Find active chat session messages
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  // Display the LATEST Agent message's Citation and Trace if activeMessageId is stale
  const activeMsg =
    messages.find((m) => m.id === activeMessageId && m.sender === "agent") ||
    [...messages].reverse().find((m) => m.sender === "agent") ||
    messages[messages.length - 1];

  const citations: Citation[] = activeMsg?.citations || [];
  const steps: ExecutionStep[] = activeMsg?.steps || activeMsg?.executionSteps || [];

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-[#0c0c0e] text-neutral-900 dark:text-slate-100 border-l border-neutral-200 dark:border-white/10 shadow-2xl z-50 flex flex-col font-sans transition-all">
      {/* Inspector Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#121215]">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold font-mono text-neutral-900 dark:text-slate-100 uppercase tracking-wider">
            Agent Inspector & Trace
          </h2>
        </div>
        <button
          onClick={() => setIsInspectorOpen(false)}
          className="p-1 rounded-lg text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-1 p-2 bg-neutral-100 dark:bg-[#08080a] border-b border-neutral-200 dark:border-white/10 text-xs font-mono overflow-x-auto">
        {[
          { id: "context", label: lang === "zh" ? "Context 上下文" : "Context", icon: FileText },
          { id: "sources", label: lang === "zh" ? `Sources 来源 (${citations.length})` : `Sources (${citations.length})`, icon: BookOpen },
          { id: "trace", label: lang === "zh" ? `Trace 链路 (${steps.length})` : `Trace (${steps.length})`, icon: Layers },
          { id: "topology", label: lang === "zh" ? "Topology 拓扑" : "Topology", icon: GitBranch },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = inspectorTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setInspectorTab(t.id as any)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs font-semibold ${
                isActive
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200 hover:bg-neutral-200 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
        {/* TAB 1: Sources (Citations) */}
        {inspectorTab === "sources" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-600 dark:text-slate-400">
              <span className="font-bold">{lang === "zh" ? "实时引用召回文档 (Citations)" : "Live RAG Citations"}</span>
              <DataSourceBadge type="LIVE" />
            </div>

            {citations.length === 0 ? (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-center space-y-2">
                <BookOpen className="w-8 h-8 text-neutral-400 dark:text-slate-500 mx-auto" />
                <p className="font-bold text-neutral-800 dark:text-slate-200">{lang === "zh" ? "无可验证来源" : "No Verified Citations"}</p>
                <p className="text-xs text-neutral-500 dark:text-slate-400">
                  {lang === "zh" ? "当前回答未直接引用向量知识库段落，或对应检索切片已为空。" : "This response didn't cite vector chunks directly."}
                </p>
              </div>
            ) : (
              citations.map((cite, idx) => (
                <div
                  key={cite.id || idx}
                  className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-2 hover:border-blue-500/40 transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-neutral-900 dark:text-slate-100 leading-snug text-xs sm:text-sm">
                      [{idx + 1}] {cite.docTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold shrink-0">
                      {(cite.similarity * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  <div className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
                    {cite.section} {cite.page ? `(p.${cite.page})` : ""}
                  </div>

                  <p className="text-neutral-800 dark:text-slate-200 bg-neutral-50 dark:bg-[#050505] p-3 rounded-lg border border-neutral-200 dark:border-white/5 font-sans leading-relaxed text-xs sm:text-sm">
                    "{cite.excerpt}"
                  </p>

                  <div className="flex items-center justify-between pt-1 font-mono text-xs text-neutral-500 dark:text-slate-400">
                    <span>KB: {cite.kbId || "kb-ipms-history"}</span>
                    <button
                      onClick={() => {
                        setSelectedCitation(cite);
                        navigate(`/documents/${cite.chunkId || "doc-101-c2"}`);
                      }}
                      className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      <span>{lang === "zh" ? "定位原文 Chunk" : "Locate Chunk"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Trace (Execution Steps) */}
        {inspectorTab === "trace" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-600 dark:text-slate-400">
              <span className="font-bold">{lang === "zh" ? "Agent 执行推演步骤" : "Agent Execution Trace"}</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{steps.length} {lang === "zh" ? "节点" : "Nodes"}</span>
            </div>

            {steps.length === 0 ? (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-center text-neutral-500 dark:text-slate-400 font-mono">
                {lang === "zh" ? "暂无 Trace 执行步骤" : "No Trace Steps"}
              </div>
            ) : (
              steps.map((st, i) => (
                <div
                  key={st.id || i}
                  className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between font-mono text-xs sm:text-sm">
                    <span className="font-bold text-neutral-900 dark:text-slate-100">
                      Step {i + 1}: {st.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        st.status === "completed" || (st.status as string) === "success"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : st.status === "failed"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          : "bg-amber-500/10 text-amber-800 dark:text-amber-400"
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{st.detail}</p>
                  <div className="text-xs font-mono text-neutral-500 dark:text-slate-400">
                    {lang === "zh" ? "耗时" : "Latency"}: {st.durationMs || 120}ms
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Context */}
        {inspectorTab === "context" && (
          <div className="space-y-3 font-mono">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-2">
              <div className="text-neutral-600 dark:text-slate-400 font-bold text-xs">{lang === "zh" ? "当前选中的 Agent 消息" : "Active Message Context"}</div>
              <div className="p-2.5 rounded bg-neutral-900 text-emerald-300 text-xs sm:text-sm break-all leading-relaxed max-h-40 overflow-y-auto">
                {activeMsg ? activeMsg.text : "无选中消息"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-1.5 text-xs sm:text-sm">
              <div className="text-neutral-600 dark:text-slate-400 font-bold">{lang === "zh" ? "Session 凭证与模型" : "Session & Model Credentials"}</div>
              <div>ID: {activeSession?.id}</div>
              <div>Model: {activeSession?.model || "Gemini 3.6 Flash"}</div>
              <div>Tokens: {activeSession?.totalTokens || 1420}</div>
            </div>
          </div>
        )}

        {/* TAB 4: Topology */}
        {inspectorTab === "topology" && (
          <div className="space-y-3 font-mono text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-2">
              <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-1.5">
                <GitBranch className="w-4 h-4" />
                <span>{lang === "zh" ? "实时 Agent 拓扑结构" : "Live Agent Topology"}</span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 text-slate-200 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <span>● Supervisor (总控 Agent)</span>
                </div>
                <div className="pl-4 space-y-1 border-l border-white/20 text-slate-300">
                  <div>├── Agent IPMS ({lang === "zh" ? "检索" : "Recall"})</div>
                  <div>├── Agent Diagnosis ({lang === "zh" ? "故障诊断" : "Diagnosis"})</div>
                  <div>└── Agent Ticket ({lang === "zh" ? "工单写操作" : "Work Order Write"})</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

