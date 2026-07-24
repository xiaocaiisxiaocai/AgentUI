import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Coins,
  ShieldAlert,
  Search,
  Check,
  X,
  Sparkles,
  Bot,
  Database,
  Wrench,
  User,
  Filter
} from "lucide-react";
import { RunRecord, ApprovalRequest, AppLanguage, ViewMode } from "../types";

interface RunsPageProps {
  runs: RunRecord[];
  approvals: ApprovalRequest[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  lang: AppLanguage;
  viewMode: ViewMode;
}

export const RunsPage: React.FC<RunsPageProps> = ({
  runs,
  approvals,
  onApproveRequest,
  onRejectRequest,
  viewMode,
}) => {
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(runs[0] || null);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>运行与 Trace 追踪中心 (Run & Trace Hub)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            实时查看全平台 Agent 运行轨迹、Token 消耗、延迟与人工审批卡片。
          </p>
        </div>

        {pendingApprovals.length > 0 && (
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>待处理人工审批卡片 ({pendingApprovals.length})</span>
          </div>
        )}
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-sm text-amber-400 flex items-center space-x-1.5 font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>拦截到需写接口人工审批请求 (Human Approval Cards)</span>
          </h2>

          {pendingApprovals.map((appr) => (
            <div
              key={appr.id}
              className="p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-100 text-sm">{appr.actionTitle}</span>
                  <span className="text-xs font-mono text-amber-300 block mt-0.5">
                    触发 Agent: {appr.agentName} | 操作类型: {appr.actionType}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                  Risk Level: {appr.riskLevel.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{appr.description}</p>

              <div className="p-3 rounded bg-black/60 border border-white/10 font-mono text-xs text-blue-300 overflow-x-auto">
                Params: {JSON.stringify(appr.params, null, 2)}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => onRejectRequest(appr.id)}
                  className="px-4 py-1.5 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10 font-bold text-xs flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>拒绝此写接口请求</span>
                </button>
                <button
                  onClick={() => onApproveRequest(appr.id)}
                  className="px-5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>批准并向 IPMS 提交</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Runs Table & Detail Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-bold text-xs font-mono text-slate-300">历史 Run 记录 ({runs.length})</h3>
          {runs.map((run) => (
            <div
              key={run.id}
              onClick={() => setSelectedRun(run)}
              className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                selectedRun?.id === run.id
                  ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-300"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-bold truncate">{run.agentName}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{run.status}</span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-1">{run.taskSummary}</p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>用户: {run.user}</span>
                <span>耗时: {run.durationMs}ms</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Run Trace Detail */}
        {selectedRun && (
          <div className="lg:col-span-2 space-y-4 p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-100">{selectedRun.taskSummary}</h3>
                <span className="text-xs font-mono text-slate-400">Run ID: {selectedRun.id} | 发起时间: {selectedRun.startTime}</span>
              </div>

              {viewMode === "expert" && (
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Tokens: {selectedRun.tokensUsed}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Cost: ${selectedRun.costUsd}
                  </span>
                </div>
              )}
            </div>

            {/* Trace Steps Timeline */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs font-mono text-slate-300">Trace 全链路分步日志 (Steps)</h4>
              <div className="relative pl-5 space-y-3 border-l-2 border-emerald-500/30">
                {selectedRun.traceSteps.map((step) => (
                  <div key={step.id} className="relative p-3 rounded-lg bg-neutral-900 border border-white/5 space-y-1">
                    <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{step.stepName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{step.durationMs}ms</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{step.detail}</p>
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
