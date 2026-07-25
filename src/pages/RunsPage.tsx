import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Check,
  X,
  Sparkles,
  Bot,
  Database,
  Wrench,
  UserCheck,
  Layers,
  ChevronRight
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { RunRecord } from "../types";
import { t } from "../i18n/translations";

export const RunsPage: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const { runs, approvals, approveRequest, rejectRequest, viewMode, lang } = useAppStore();
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(runs[0] || null);

  useEffect(() => {
    if (paramId) {
      const found = runs.find((r) => r.id === paramId);
      if (found) {
        setSelectedRun(found);
      }
    }
  }, [paramId, runs]);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const filteredRuns = runs.filter(
    (r) =>
      r.taskSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Activity className="w-6 h-6 text-emerald-500" />
            <span>{t("runsTitle", lang)}</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 mt-1">
            {t("runsSub", lang)}
          </p>
        </div>

        {pendingApprovals.length > 0 && (
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{lang === "zh" ? `待处理人工审批卡片 (${pendingApprovals.length})` : `Pending Approvals (${pendingApprovals.length})`}</span>
          </div>
        )}
      </div>

      {/* Pending Approvals Section Banner */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-sm sm:text-base text-amber-700 dark:text-amber-400 flex items-center space-x-2 font-mono">
            <ShieldAlert className="w-5 h-5" />
            <span>{lang === "zh" ? "拦截到需写接口人工审批请求 (Human Approval Required)" : "Human Approval Required for API Writes"}</span>
          </h2>

          {pendingApprovals.map((appr) => (
            <div
              key={appr.id}
              className="p-5 rounded-2xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-slate-100 text-base">{appr.actionTitle}</span>
                  <span className="text-xs sm:text-sm font-mono text-amber-800 dark:text-amber-300 block mt-0.5">
                    {lang === "zh" ? "触发 Agent" : "Trigger Agent"}: {appr.agentName} | {lang === "zh" ? "操作类型" : "Action Type"}: {appr.actionType}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-lg bg-amber-200 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 text-xs font-mono font-bold self-start sm:self-center">
                  Risk Level: {appr.riskLevel.toUpperCase()}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-800 dark:text-slate-200 leading-relaxed font-medium">{appr.description}</p>

              <div className="p-3 rounded-lg bg-slate-900 dark:bg-black/80 border border-neutral-700 dark:border-white/10 font-mono text-xs text-blue-300 overflow-x-auto">
                Params: {JSON.stringify(appr.params, null, 2)}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => rejectRequest(appr.id)}
                  className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>{lang === "zh" ? "拒绝此写接口请求" : "Reject Write API"}</span>
                </button>
                <button
                  onClick={() => approveRequest(appr.id)}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === "zh" ? "批准并提交" : "Approve & Submit"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchPlaceholder", lang)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#121215] text-xs sm:text-sm text-neutral-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
        />
      </div>

      {/* Runs Table & Detail Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-bold text-xs sm:text-sm font-mono text-neutral-600 dark:text-slate-300">
            {lang === "zh" ? `历史 Run 记录 (${filteredRuns.length})` : `Run History (${filteredRuns.length})`}
          </h3>
          {filteredRuns.map((run) => (
            <div
              key={run.id}
              onClick={() => setSelectedRun(run)}
              className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                selectedRun?.id === run.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 font-bold text-emerald-800 dark:text-emerald-300 shadow-md"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] text-neutral-700 dark:text-slate-300 hover:border-neutral-400 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-neutral-900 dark:text-slate-100 font-bold truncate">{run.agentName}</span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">{run.status}</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 line-clamp-1">{run.taskSummary}</p>

              <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-slate-400 pt-1">
                <span>{lang === "zh" ? "用户" : "User"}: {run.user}</span>
                <span>{lang === "zh" ? "耗时" : "Duration"}: {run.durationMs}ms</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Run Trace Detail & Full Timeline */}
        {selectedRun && (
          <div className="lg:col-span-2 space-y-5 p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-slate-100">{selectedRun.taskSummary}</h3>
                <span className="text-xs sm:text-sm font-mono text-neutral-500 dark:text-slate-400">Run ID: {selectedRun.id} | {lang === "zh" ? "发起时间" : "Started"}: {selectedRun.startTime}</span>
              </div>

              {viewMode === "expert" && (
                <div className="flex items-center space-x-3 text-xs sm:text-sm font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-bold">
                    Tokens: {selectedRun.tokensUsed}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-bold">
                    Cost: ${selectedRun.costUsd}
                  </span>
                </div>
              )}
            </div>

            {/* Trace Steps Timeline */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs sm:text-sm font-mono text-neutral-700 dark:text-slate-300">
                {lang === "zh" ? "完整执行时间线 (Execution Step Timeline)" : "Execution Step Timeline"}
              </h4>
              <div className="relative pl-6 space-y-4 border-l-2 border-emerald-500/40">
                {selectedRun.traceSteps.map((step, idx) => (
                  <div key={step.id || idx} className="relative p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-white/10 space-y-1.5 shadow-xs">
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-black flex items-center justify-center font-mono text-[10px] font-bold text-white dark:text-black">
                      {idx + 1}
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-neutral-900 dark:text-slate-100">{step.stepName}</span>
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">{step.durationMs}ms</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 font-mono leading-relaxed">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

