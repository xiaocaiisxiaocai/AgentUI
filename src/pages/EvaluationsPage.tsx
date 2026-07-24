import React from "react";
import { BarChart3, TrendingUp, CheckCircle2, ShieldCheck, Sparkles, Target } from "lucide-react";
import { EvaluationMetric, AppLanguage, ViewMode } from "../types";

interface EvaluationsPageProps {
  metrics: EvaluationMetric[];
  lang: AppLanguage;
  viewMode: ViewMode;
}

export const EvaluationsPage: React.FC<EvaluationsPageProps> = ({ metrics }) => {
  const ragMetrics = metrics.filter((m) => m.category === "RAG");
  const agentMetrics = metrics.filter((m) => m.category === "Agent");

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          <span>评测中心 (Evaluation & Benchmark Center)</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
          基于标准金标准测试集的 RAG 上下文召回率、幻觉率、回答忠实度与 Agent 任务工具调用准确率量化评估。
        </p>
      </div>

      {/* RAG Metrics Grid */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-blue-400 flex items-center space-x-1.5 font-mono">
          <Target className="w-4 h-4" />
          <span>RAG 知识检索评测指标 (RAG Evaluation Metrics)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ragMetrics.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{m.metricName}</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{m.trend}</span>
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-blue-400 font-mono">{m.score}%</span>
                <span className="text-xs text-slate-400 font-mono">/ 目标 {m.target}%</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Metrics Grid */}
      <div className="space-y-3 pt-4">
        <h2 className="font-bold text-sm text-purple-400 flex items-center space-x-1.5 font-mono">
          <Sparkles className="w-4 h-4" />
          <span>Agent 行为与工具调用评测指标 (Agent Behavior Metrics)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agentMetrics.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{m.metricName}</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{m.trend}</span>
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-purple-400 font-mono">{m.score}%</span>
                <span className="text-xs text-slate-400 font-mono">/ 目标 {m.target}%</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
