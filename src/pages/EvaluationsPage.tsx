import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Target,
  Play,
  Database,
  CheckCircle2,
  ListFilter,
  FileText,
  Clock,
  Layers,
  Activity
} from "lucide-react";
import { EvaluationMetric, EvalDataset } from "../types";
import { initialEvaluations } from "../data/mockEnterpriseData";

const defaultDatasets: EvalDataset[] = [
  {
    id: "ds-1",
    name: "IPMS 504 硬件报错金标准测试集",
    description: "覆盖 150 组物理工单与设备网关离线报错的真实问答与 Chunk 引用对。",
    category: "RAG",
    sampleCount: 150,
    lastRunScore: 98.2,
    updatedAt: "2026-07-24 10:15",
  },
  {
    id: "ds-2",
    name: "Excel 高阶函数多表比对断言集",
    description: "包含 80 个 OpenPyXL 公式构建与跨表比对需求的边界测试样例。",
    category: "Agent",
    sampleCount: 80,
    lastRunScore: 96.5,
    updatedAt: "2026-07-24 09:30",
  },
  {
    id: "ds-3",
    name: "写接口高危 API 拦截与审批边界测试集",
    description: "测试 Guardrail 是否能够 100% 拦截物理修改工单并正确生成人工审批单。",
    category: "Tool",
    sampleCount: 45,
    lastRunScore: 100.0,
    updatedAt: "2026-07-24 08:00",
  },
];

export const EvaluationsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<EvaluationMetric[]>(initialEvaluations);
  const [datasets, setDatasets] = useState<EvalDataset[]>(defaultDatasets);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const ragMetrics = metrics.filter((m) => m.category === "RAG");
  const agentMetrics = metrics.filter((m) => m.category === "Agent");

  const handleRunBatchEval = () => {
    setIsRunningBatch(true);
    setBatchProgress(10);

    const interval = setInterval(() => {
      setBatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningBatch(false);
          // slightly update scores to simulate run
          setMetrics((old) =>
            old.map((m) => ({
              ...m,
              score: Math.min(100, Number((m.score + 0.2).toFixed(1))),
            }))
          );
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>评测中心 (Evaluation & Benchmark Center)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            基于标准金标准测试集的 RAG 上下文召回率、幻觉率、回答忠实度与 Agent 任务工具调用准确率量化评估。
          </p>
        </div>

        <button
          onClick={handleRunBatchEval}
          disabled={isRunningBatch}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md shrink-0 transition-all"
        >
          <Play className={`w-4 h-4 ${isRunningBatch ? "animate-spin" : ""}`} />
          <span>{isRunningBatch ? `评测运行中 (${batchProgress}%)` : "发起全量自动化回归评测"}</span>
        </button>
      </div>

      {/* Progress Bar during Batch Eval */}
      {isRunningBatch && (
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
          <div className="flex justify-between text-xs font-mono text-purple-300 font-bold">
            <span>正在对 275 组测试用例执行自动化逻辑与语义断言...</span>
            <span>{batchProgress}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-500 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${batchProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* RAG Metrics Grid */}
      <div className="space-y-3">
        <h2 className="font-bold text-xs sm:text-sm text-blue-700 dark:text-blue-400 flex items-center space-x-1.5 font-mono">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>RAG 知识检索评测指标 (RAG Evaluation Metrics)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ragMetrics.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] space-y-3 shadow-sm hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-neutral-900 dark:text-slate-200">{m.metricName}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{m.trend}</span>
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-mono">{m.score}%</span>
                <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">/ 目标 {m.target}%</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 leading-relaxed font-sans">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Metrics Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="font-bold text-xs sm:text-sm text-purple-700 dark:text-purple-400 flex items-center space-x-1.5 font-mono">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Agent 行为与工具调用评测指标 (Agent Behavior Metrics)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agentMetrics.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] space-y-3 shadow-sm hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-neutral-900 dark:text-slate-200">{m.metricName}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{m.trend}</span>
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-purple-700 dark:text-purple-400 font-mono">{m.score}%</span>
                <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">/ 目标 {m.target}%</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 leading-relaxed font-sans">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Golden Benchmark Datasets Table */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
          <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>基准测试集管理 (Golden Evaluation Datasets)</span>
          </h3>
          <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">共 {datasets.length} 个基准库</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-slate-400 bg-neutral-50 dark:bg-white/5 font-bold">
                <th className="p-3">测试集名称</th>
                <th className="p-3">分类</th>
                <th className="p-3">样例数量</th>
                <th className="p-3">得分 (Pass Rate)</th>
                <th className="p-3">最近评测时间</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
              {datasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-neutral-900 dark:text-slate-200">{ds.name}</div>
                    <div className="text-xs font-sans text-neutral-500 dark:text-slate-400 line-clamp-1">{ds.description}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-500/20">
                      {ds.category}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-800 dark:text-slate-300">{ds.sampleCount} 个 QA 样例</td>
                  <td className="p-3 text-emerald-700 dark:text-emerald-400 font-bold">{ds.lastRunScore}%</td>
                  <td className="p-3 text-neutral-500 dark:text-slate-400">{ds.updatedAt}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={handleRunBatchEval}
                      className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/40 text-purple-900 dark:text-purple-300 text-xs font-bold border border-purple-300 dark:border-purple-500/30"
                    >
                      单项断言
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
