import React, { useState } from "react";
import {
  Workflow,
  Plus,
  Play,
  Bot,
  Database,
  Wrench,
  ShieldCheck,
  Code2,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sliders
} from "lucide-react";
import { Workflow as WorkflowType, AppLanguage, ViewMode } from "../types";

interface WorkflowsPageProps {
  workflows: WorkflowType[];
  onAddWorkflow: (wf: WorkflowType) => void;
  lang: AppLanguage;
  viewMode: ViewMode;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ workflows, onAddWorkflow }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>(workflows[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);

  const handleRunWorkflow = () => {
    setIsRunning(true);
    setRunLogs(["[00:00.100] 启动 DAG 工作流图图谱引擎...", "[00:00.300] 节点 N1: 接收现场报错描述输入"]);

    setTimeout(() => {
      setRunLogs((prev) => [...prev, "[00:00.600] 节点 N2: 命中【售后技术部 RAG 知识库】召回 3 Chunks"]);
    }, 600);

    setTimeout(() => {
      setRunLogs((prev) => [...prev, "[00:01.100] 节点 N3: 调用【Agent 故障诊断模型】完成推理树"]);
    }, 1100);

    setTimeout(() => {
      setRunLogs((prev) => [
        ...prev,
        "[00:01.400] 节点 N4: 人工审批拦截通过 (Approval Passed)",
        "[00:01.800] 工作流完整运行成功 (SUCCESS - 1800ms)"
      ]);
      setIsRunning(false);
    }, 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Workflow className="w-6 h-6 text-purple-400" />
            <span>工作流编排中心 (Workflow DAG Canvas)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            支持编排 Agent Node、External Agent Node、RAG Node、Tool Node、Human Approval Node 与 Code Node。
          </p>
        </div>

        <button
          onClick={handleRunWorkflow}
          disabled={isRunning}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <Play className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
          <span>{isRunning ? "工作流运行中..." : "测试运行当前工作流 DAG"}</span>
        </button>
      </div>

      {/* DAG Node Palette & Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Workflow List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="font-bold text-xs font-mono text-slate-300">所有编排工作流</h3>
          {workflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => setSelectedWorkflow(wf)}
              className={`p-3.5 rounded-xl border cursor-pointer space-y-1.5 transition-all ${
                selectedWorkflow.id === wf.id
                  ? "border-purple-500 bg-purple-500/10 font-bold text-purple-300"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200">{wf.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{wf.status}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{wf.description}</p>
            </div>
          ))}
        </div>

        {/* Right Canvas DAG */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl min-h-[360px] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100">{selectedWorkflow.name}</h3>
                <span className="text-xs text-slate-400 font-mono">DAG 节点数: {selectedWorkflow.nodes.length}</span>
              </div>
            </div>

            {/* DAG Nodes Flow */}
            <div className="flex flex-wrap items-center gap-3 py-4 overflow-x-auto">
              {selectedWorkflow.nodes.map((node, i) => (
                <React.Fragment key={node.id}>
                  <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 text-slate-200 shadow-md flex items-center space-x-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold">
                      {node.type === "rag" ? (
                        <Database className="w-4 h-4 text-blue-400" />
                      ) : node.type === "llm" ? (
                        <Bot className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Code2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-slate-100">{node.label}</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{node.type} Node</span>
                    </div>
                  </div>

                  {i < selectedWorkflow.nodes.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Run Logs Output */}
            {runLogs.length > 0 && (
              <div className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-emerald-400 space-y-1">
                <div className="font-bold text-slate-400 border-b border-white/10 pb-1 mb-2">执行轨迹日志 (DAG Logs):</div>
                {runLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
