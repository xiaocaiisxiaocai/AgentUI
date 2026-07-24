import React, { useState } from "react";
import {
  GitFork,
  Play,
  Plus,
  Trash2,
  Settings,
  ArrowRight,
  Database,
  Bot,
  Code2,
  Filter,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Workflow, WorkflowNode, AppLanguage } from "../types";
import { t } from "../i18n/translations";

interface WorkflowCanvasProps {
  workflows: Workflow[];
  activeWorkflowId: string;
  setActiveWorkflowId: (id: string) => void;
  lang: AppLanguage;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflows,
  activeWorkflowId,
  setActiveWorkflowId,
  lang,
}) => {
  const currentWf = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];
  const [nodes, setNodes] = useState<WorkflowNode[]>(currentWf ? currentWf.nodes : []);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunningNodeId, setActiveRunningNodeId] = useState<string | null>(null);

  // Add node handler
  const handleAddNode = (type: WorkflowNode["type"]) => {
    const labels = {
      input: "新用户输入节点",
      rag: "RAG 向量检索节点",
      llm: "Gemini 大模型推演",
      code: "Python 沙盒执行器",
      filter: "条件路由过滤器",
      plugin: "第三方插件工具",
      output: "结果终端输出",
    };

    const newNode: WorkflowNode = {
      id: "n-" + Date.now(),
      type,
      label: labels[type] || "自定义节点",
      position: { x: 100 + nodes.length * 60, y: 150 },
      config: { model: "gemini-3.6-flash", temp: 0.7 },
      status: "idle",
    };

    setNodes([...nodes, newNode]);
  };

  // Run Test Workflow execution simulation
  const handleRunWorkflow = async () => {
    setIsRunning(true);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      setActiveRunningNodeId(node.id);
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: "running" } : n))
      );

      // Simulate node step execution delay
      await new Promise((res) => setTimeout(res, 800));

      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: "success" } : n))
      );
    }
    setActiveRunningNodeId(null);
    setIsRunning(false);
  };

  // Node icon resolver
  const getNodeIcon = (type: WorkflowNode["type"]) => {
    switch (type) {
      case "rag":
        return Database;
      case "llm":
        return Bot;
      case "code":
        return Code2;
      case "filter":
        return Filter;
      default:
        return Zap;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-neutral-100 dark:bg-[#050505] overflow-hidden">
      {/* Top Workflow Control Header */}
      <div className="px-6 py-3 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shadow-md">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <select
                value={activeWorkflowId}
                onChange={(e) => {
                  setActiveWorkflowId(e.target.value);
                  const selected = workflows.find((w) => w.id === e.target.value);
                  if (selected) setNodes(selected.nodes);
                }}
                className="font-bold text-sm bg-transparent text-neutral-900 dark:text-slate-100 border-none focus:outline-none cursor-pointer"
              >
                {workflows.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#151515] text-slate-200">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              {currentWf?.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-white font-mono font-bold text-xs shadow-md transition-all ${
              isRunning ? "bg-purple-600/50" : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? t("runningWorkflow", lang) : t("runWorkflow", lang)}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-auto p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Node Library Toolbox floating bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 p-2 rounded border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-md shadow-lg text-xs font-mono">
          <span className="font-bold text-slate-500 px-1 uppercase text-[10px]">TOOLBOX:</span>
          <button
            onClick={() => handleAddNode("input")}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-medium"
          >
            + INPUT
          </button>
          <button
            onClick={() => handleAddNode("rag")}
            className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-medium"
          >
            + RAG VEC
          </button>
          <button
            onClick={() => handleAddNode("llm")}
            className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium"
          >
            + GEMINI LLM
          </button>
          <button
            onClick={() => handleAddNode("code")}
            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium"
          >
            + PYTHON
          </button>
          <button
            onClick={() => handleAddNode("filter")}
            className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium"
          >
            + FILTER
          </button>
        </div>

        {/* Nodes Canvas Grid Layout */}
        <div className="flex flex-wrap items-center gap-6 pt-16 max-w-6xl mx-auto">
          {nodes.map((node, index) => {
            const Icon = getNodeIcon(node.type);
            const isCurrentActive = activeRunningNodeId === node.id;
            const isSuccess = node.status === "success";

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`w-60 p-3.5 rounded border bg-white dark:bg-[#151515] shadow-md cursor-pointer transition-all ${
                    isCurrentActive
                      ? "border-purple-500 ring-2 ring-purple-500/30"
                      : isSuccess
                      ? "border-emerald-500/80"
                      : "border-neutral-200 dark:border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-neutral-800 dark:text-slate-200 truncate">
                        {node.label}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNodes(nodes.filter((n) => n.id !== node.id));
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono mb-3 uppercase">
                    TYPE: {node.type}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-neutral-100 dark:border-white/5">
                    <span className="text-slate-500">STATUS:</span>
                    {isCurrentActive ? (
                      <span className="text-purple-400 font-bold flex items-center space-x-1 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        <span>RUNNING</span>
                      </span>
                    ) : isSuccess ? (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SUCCESS</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">IDLE</span>
                    )}
                  </div>
                </div>

                {index < nodes.length - 1 && (
                  <div className="flex items-center justify-center text-purple-400">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Parameter Settings Drawer */}
      {selectedNode && (
        <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-neutral-800 dark:text-slate-200">
              NODE CONFIG: {selectedNode.label}
            </span>
            <div className="flex items-center space-x-2 text-slate-400">
              <span>MODEL:</span>
              <select className="border border-white/10 rounded px-2 py-1 bg-neutral-50 dark:bg-[#151515] text-neutral-800 dark:text-slate-200">
                <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 font-medium"
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
};
