import React, { useState } from "react";
import {
  Wrench,
  Plus,
  Search,
  Database,
  Code2,
  FileSpreadsheet,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Play,
  Bot,
  Layers,
  AlertCircle,
  X
} from "lucide-react";
import { ToolDefinition, AppLanguage } from "../types";

interface ToolsPageProps {
  tools: ToolDefinition[];
  onAddTool: (tool: ToolDefinition) => void;
  lang: AppLanguage;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ tools, onAddTool }) => {
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const filteredTools = tools.filter((t) => {
    const matchesDept = selectedDept === "All" || t.department.includes(selectedDept);
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const handleRunTest = () => {
    if (!selectedTool) return;
    setIsTesting(true);
    setTestOutput(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestOutput(
        JSON.stringify(
          {
            status: "success",
            executionTimeMs: selectedTool.avgLatencyMs,
            toolExecuted: selectedTool.name,
            result: {
              success: true,
              data: "Tool execution sandbox returned valid structured response."
            }
          },
          null,
          2
        )
      );
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Wrench className="w-6 h-6 text-amber-400" />
            <span>工具中心 (Tool Center)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            独立管理 Agent 可执行的能力（SQL 查询、工单写入、Python 沙盒、MCP 硬件调控与审批规则）。
          </p>
        </div>

        <button
          onClick={() => {
            const newTool: ToolDefinition = {
              id: "tool-" + Date.now(),
              name: "新自定义 Webhook 工具",
              type: "HTTP",
              description: "通过 HTTP POST 发起第三方系统通知",
              department: "售后技术部",
              status: "active",
              inputSchema: "{\n  \"payload\": \"object\"\n}",
              outputSchema: "{\n  \"received\": \"boolean\"\n}",
              requiresApproval: false,
              avgLatencyMs: 120,
              successRate: 100,
              usageCount: 0,
              usedByAgentCount: 1,
            };
            onAddTool(newTool);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>新建工具 (Add Tool)</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs font-mono">
          {["All", "售后技术部", "运营助理部", "通用行政部"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDept === d
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : "bg-white dark:bg-[#121215] text-slate-400 hover:text-white border border-neutral-200 dark:border-white/10"
              }`}
            >
              {d === "All" ? `全部部门 (${tools.length})` : d}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索工具名称或类型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs">
                  {tool.type}
                </span>
                {tool.requiresApproval && (
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px] font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>需人工确认</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{tool.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400 bg-neutral-50 dark:bg-white/5 p-2.5 rounded-lg">
                <div>
                  延迟: <span className="text-slate-200 font-bold">{tool.avgLatencyMs} ms</span>
                </div>
                <div>
                  成功率: <span className="text-emerald-400 font-bold">{tool.successRate}%</span>
                </div>
                <div>
                  绑定 Agent: <span className="text-blue-400 font-bold">{tool.usedByAgentCount} 个</span>
                </div>
                <div>
                  调用次数: <span className="text-slate-200 font-bold">{tool.usageCount}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">所属: {tool.department}</span>
              <button
                onClick={() => {
                  setSelectedTool(tool);
                  setTestInput(tool.inputSchema);
                  setTestOutput(null);
                }}
                className="px-3 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold font-mono text-xs border border-amber-500/30 transition-colors"
              >
                测试 Schema & 验证
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tool Test Modal / Drawer */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200 dark:border-white/10 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">{selectedTool.name} - 沙盒调试</h3>
              </div>
              <button onClick={() => setSelectedTool(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">{selectedTool.description}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1 font-bold">Input JSON Schema 测试输入</label>
                <textarea
                  rows={4}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 font-mono text-blue-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isTesting ? "工具测试中..." : "在沙盒中运行测试"}</span>
                </button>
              </div>

              {testOutput && (
                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">Output JSON 响应结果</label>
                  <pre className="p-3 rounded bg-neutral-950 border border-white/10 font-mono text-emerald-400 overflow-x-auto">
                    {testOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
