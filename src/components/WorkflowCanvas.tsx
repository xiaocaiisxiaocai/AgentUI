import React, { useState, useRef } from "react";
import {
  GitFork,
  Play,
  Trash2,
  Database,
  Bot,
  Code2,
  Filter,
  CheckCircle2,
  Sparkles,
  Zap,
  Plus,
  RefreshCw
} from "lucide-react";
import { Workflow, WorkflowNode } from "../types";
import { useAppStore } from "../store/useAppStore";

export const WorkflowCanvas: React.FC = () => {
  const { workflows } = useAppStore();
  const [activeWfId, setActiveWfId] = useState<string>(workflows[0]?.id || "wf-101");
  const currentWf = workflows.find((w) => w.id === activeWfId) || workflows[0];

  const [nodes, setNodes] = useState<WorkflowNode[]>(currentWf ? currentWf.nodes : []);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunningNodeId, setActiveRunningNodeId] = useState<string | null>(null);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 100;
    const y = e.clientY - rect.top - 40;

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, position: { x: Math.max(20, x), y: Math.max(20, y) } } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Add node handler
  const handleAddNode = (type: WorkflowNode["type"]) => {
    const labels = {
      input: "新用户意图输入",
      rag: "IPMS 向量召回节点",
      llm: "Gemini 3.6 Flash 推理",
      code: "Python 沙盒校验",
      filter: "安全权限与高危拦截",
      plugin: "第三方写接口工具",
      output: "结构化结果输出",
    };

    const newNode: WorkflowNode = {
      id: "n-" + Date.now(),
      type,
      label: labels[type] || "自定义节点",
      position: { x: 120 + (nodes.length % 3) * 220, y: 120 + Math.floor(nodes.length / 3) * 160 },
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
    <div className="flex-1 flex flex-col h-full bg-neutral-100 dark:bg-[#050505] overflow-hidden select-none">
      {/* Top Workflow Control Header */}
      <div className="px-6 py-3 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shadow-md">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <select
                value={activeWfId}
                onChange={(e) => {
                  setActiveWfId(e.target.value);
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-mono font-bold text-xs shadow-md transition-all ${
              isRunning ? "bg-purple-600/50" : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "工作流运行编排中..." : "运行拖拽工作流测试"}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 relative overflow-hidden p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {/* SVG Dynamic Connection Curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {nodes.map((node, i) => {
            if (i === nodes.length - 1) return null;
            const nextNode = nodes[i + 1];
            const startX = node.position.x + 220;
            const startY = node.position.y + 40;
            const endX = nextNode.position.x;
            const endY = nextNode.position.y + 40;
            const controlX1 = startX + (endX - startX) / 2;
            const controlX2 = startX + (endX - startX) / 2;

            return (
              <path
                key={`line-${node.id}-${nextNode.id}`}
                d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={node.status === "running" ? "#a855f7" : "#3b82f6"}
                strokeWidth="2.5"
                strokeDasharray={node.status === "running" ? "6,6" : "none"}
                className={node.status === "running" ? "animate-pulse" : ""}
              />
            );
          })}
        </svg>

        {/* Node Library Toolbox floating bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 p-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-md shadow-lg text-xs font-mono">
          <span className="font-bold text-slate-500 px-1 uppercase text-[10px]">可拖拽节点库:</span>
          <button
            onClick={() => handleAddNode("input")}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium"
          >
            + INPUT
          </button>
          <button
            onClick={() => handleAddNode("rag")}
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-medium"
          >
            + RAG VEC
          </button>
          <button
            onClick={() => handleAddNode("llm")}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium"
          >
            + GEMINI LLM
          </button>
          <button
            onClick={() => handleAddNode("code")}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium"
          >
            + PYTHON
          </button>
          <button
            onClick={() => handleAddNode("filter")}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium"
          >
            + FILTER
          </button>
        </div>

        {/* Nodes Absolute Positioning Canvas */}
        {nodes.map((node) => {
          const Icon = getNodeIcon(node.type);
          const isCurrentActive = activeRunningNodeId === node.id;
          const isSuccess = node.status === "success";

          return (
            <div
              key={node.id}
              style={{ left: `${node.position.x}px`, top: `${node.position.y}px` }}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              onClick={() => setSelectedNode(node)}
              className={`absolute w-56 p-4 rounded-2xl border bg-white dark:bg-[#121215] shadow-2xl cursor-grab active:cursor-grabbing transition-all z-10 ${
                isCurrentActive
                  ? "border-purple-500 ring-2 ring-purple-500/30 shadow-purple-500/20"
                  : isSuccess
                  ? "border-emerald-500/80"
                  : "border-neutral-200 dark:border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-neutral-800 dark:text-slate-200 truncate max-w-[110px]">
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

              <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase">
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
          );
        })}
      </div>

      {/* Selected Node Parameter Settings Drawer */}
      {selectedNode && (
        <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] flex items-center justify-between text-xs font-mono z-20">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-neutral-800 dark:text-slate-200">
              节点属性配置: {selectedNode.label}
            </span>
            <div className="flex items-center space-x-2 text-slate-400">
              <span>模型:</span>
              <select className="border border-white/10 rounded px-2 py-1 bg-neutral-50 dark:bg-[#151515] text-neutral-800 dark:text-slate-200">
                <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-medium"
          >
            关闭属性
          </button>
        </div>
      )}
    </div>
  );
};
