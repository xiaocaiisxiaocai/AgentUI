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
  } = useAppStore();

  if (!isInspectorOpen) return null;

  // Find active chat session messages
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  // P0 Rule 2 Fix: Display the LATEST Agent message's Citation and Trace if activeMessageId is stale
  const activeMsg =
    messages.find((m) => m.id === activeMessageId && m.sender === "agent") ||
    [...messages].reverse().find((m) => m.sender === "agent") ||
    messages[messages.length - 1];

  const citations: Citation[] = activeMsg?.citations || [];
  const steps: ExecutionStep[] = activeMsg?.steps || activeMsg?.executionSteps || [];

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-[#0c0c0e] border-l border-neutral-200 dark:border-white/10 shadow-2xl z-50 flex flex-col font-sans transition-all">
      {/* Inspector Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#121215]">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
            Agent Inspector & Trace
          </h2>
        </div>
        <button
          onClick={() => setIsInspectorOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-1 p-2 bg-neutral-100 dark:bg-[#08080a] border-b border-neutral-200 dark:border-white/10 text-[11px] font-mono overflow-x-auto">
        {[
          { id: "context", label: "Context 上下文", icon: FileText },
          { id: "sources", label: `Sources 来源 (${citations.length})`, icon: BookOpen },
          { id: "trace", label: `Trace 链路 (${steps.length})`, icon: Layers },
          { id: "topology", label: "Topology 拓扑", icon: GitBranch },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = inspectorTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setInspectorTab(t.id as any)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: Sources (Citations) */}
        {inspectorTab === "sources" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold">实时引用召回文档 (Citations)</span>
              <DataSourceBadge type="LIVE" />
            </div>

            {/* P0 Rule 4: Display "无可验证来源" if citations array is empty */}
            {citations.length === 0 ? (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-bold text-slate-300">无可验证来源</p>
                <p className="text-[11px] text-slate-500">
                  当前回答未直接引用向量知识库段落，或对应检索切片已为空。
                </p>
              </div>
            ) : (
              citations.map((cite, idx) => (
                <div
                  key={cite.id || idx}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-2 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-200 leading-snug">
                      [{idx + 1}] {cite.docTitle}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                      {(cite.similarity * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  <div className="text-[11px] text-blue-400 font-mono">
                    {cite.section} {cite.page ? `(p.${cite.page})` : ""}
                  </div>

                  <p className="text-slate-300 bg-neutral-100 dark:bg-[#050505] p-2.5 rounded-lg border border-neutral-200 dark:border-white/5 font-sans leading-relaxed text-[11px]">
                    "{cite.excerpt}"
                  </p>

                  <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-500">
                    <span>KB: {cite.kbId || "kb-ipms-history"}</span>
                    <button
                      onClick={() => {
                        setSelectedCitation(cite);
                        navigate(`/documents/${cite.chunkId || "doc-101-c2"}`);
                      }}
                      className="flex items-center space-x-1 text-blue-400 hover:underline"
                    >
                      <span>定位原文 Chunk</span>
                      <ExternalLink className="w-3 h-3" />
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
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold">Agent 执行推演步骤</span>
              <span className="text-blue-400 font-bold">{steps.length} 节点</span>
            </div>

            {steps.length === 0 ? (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-center text-slate-400 font-mono">
                暂无 Trace 执行步骤
              </div>
            ) : (
              steps.map((st, i) => (
                <div
                  key={st.id || i}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-200">
                      Step {i + 1}: {st.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        st.status === "completed" || (st.status as string) === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : st.status === "failed"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{st.detail}</p>
                  <div className="text-[10px] font-mono text-slate-500">
                    耗时: {st.durationMs || 120}ms
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Context */}
        {inspectorTab === "context" && (
          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-2">
              <div className="text-slate-400 font-bold text-[11px]">当前选中的 Agent 消息</div>
              <div className="p-2 rounded bg-neutral-900 text-emerald-300 text-[11px] break-all leading-relaxed max-h-40 overflow-y-auto">
                {activeMsg ? activeMsg.text : "无选中消息"}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-1 text-[11px]">
              <div className="text-slate-400 font-bold">Session 凭证与模型</div>
              <div>ID: {activeSession?.id}</div>
              <div>Model: {activeSession?.model || "Gemini 3.6 Flash"}</div>
              <div>Token 消耗: {activeSession?.totalTokens || 1420}</div>
            </div>
          </div>
        )}

        {/* TAB 4: Topology */}
        {inspectorTab === "topology" && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] space-y-2">
              <div className="font-bold text-purple-400 flex items-center space-x-1">
                <GitBranch className="w-4 h-4" />
                <span>实时 Agent 拓扑结构</span>
              </div>
              <div className="p-3 rounded bg-neutral-900 text-slate-200 space-y-2 text-[11px]">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <span>● Supervisor (总控)</span>
                </div>
                <div className="pl-4 space-y-1 border-l border-white/20 text-slate-300">
                  <div>├── Agent IPMS (检索)</div>
                  <div>├── Agent Diagnosis (诊断)</div>
                  <div>└── Agent Ticket (工单写操作)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
