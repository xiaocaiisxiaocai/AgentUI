import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Wrench,
  Plus,
  Search,
  ShieldCheck,
  Play,
  Link2,
  CheckCircle2,
  X
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { ToolDefinition } from "../types";

export const ToolsPage: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const { tools, connectors, addTool } = useAppStore();
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);

  useEffect(() => {
    if (paramId) {
      const found = tools.find((t) => t.id === paramId);
      if (found) {
        setSelectedTool(found);
      }
    }
  }, [paramId, tools]);
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
            connectorLinked: connectors.find((c) => c.id === selectedTool.connectorId)?.name || "Direct API",
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
            <span>工具中心 (Tool Center & Connector Association)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            独立管理 Agent 可执行的能力（SQL 查询、工单写入、Python 沙盒、MCP 硬件调控）并建立与底座 Connector 的关联。
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
              connectorId: "conn-ipms-rest",
              avgLatencyMs: 120,
              successRate: 100,
              usageCount: 0,
              usedByAgentCount: 1,
            };
            addTool(newTool);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>新建工具 (Add Tool)</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs sm:text-sm font-mono">
          {["All", "售后技术部", "运营助理部", "通用行政部"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                selectedDept === d
                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/30"
                  : "bg-white dark:bg-[#121215] text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/10"
              }`}
            >
              {d === "All" ? `全部部门 (${tools.length})` : d}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="搜索工具名称或类型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] text-xs sm:text-sm text-neutral-900 dark:text-slate-100 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const linkedConnector = connectors.find((c) => c.id === tool.connectorId);
          return (
            <div
              key={tool.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-mono font-bold text-xs">
                    {tool.type}
                  </span>
                  {tool.requiresApproval && (
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-mono text-xs font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>需人工确认</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100">{tool.name}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2 font-sans">
                    {tool.description}
                  </p>
                </div>

                {/* Visible Link to Connector */}
                {linkedConnector && (
                  <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-xs font-mono flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-slate-400 flex items-center space-x-1">
                      <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>绑定底层 Connector:</span>
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 truncate max-w-[140px]">{linkedConnector.name}</span>
                  </div>
                )}

                <div className="pt-2 grid grid-cols-2 gap-2 font-mono text-xs text-neutral-600 dark:text-slate-400 bg-neutral-50 dark:bg-white/5 p-2.5 rounded-lg border border-neutral-100 dark:border-transparent">
                  <div>
                    延迟: <span className="text-neutral-900 dark:text-slate-200 font-bold">{tool.avgLatencyMs} ms</span>
                  </div>
                  <div>
                    成功率: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{tool.successRate}%</span>
                  </div>
                  <div>
                    绑定 Agent: <span className="text-blue-700 dark:text-blue-400 font-bold">{tool.usedByAgentCount} 个</span>
                  </div>
                  <div>
                    调用次数: <span className="text-neutral-900 dark:text-slate-200 font-bold">{tool.usageCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">所属: {tool.department}</span>
                <button
                  onClick={() => {
                    setSelectedTool(tool);
                    setTestInput(tool.inputSchema);
                    setTestOutput(null);
                  }}
                  className="px-3 py-1 rounded bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold font-mono text-xs sm:text-sm border border-amber-300 dark:border-amber-500/30 transition-colors"
                >
                  测试 Schema & 验证
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tool Test Modal */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200 dark:border-white/10 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-slate-100">{selectedTool.name} - 沙盒调试</h3>
              </div>
              <button onClick={() => setSelectedTool(null)} className="text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 font-sans">{selectedTool.description}</p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-neutral-800 dark:text-slate-300 font-mono mb-1 font-bold">Input JSON Schema 测试输入</label>
                <textarea
                  rows={4}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full p-3 rounded-lg bg-neutral-900 text-blue-300 border border-neutral-800 font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md"
                >
                  <Play className="w-4 h-4" />
                  <span>{isTesting ? "工具测试中..." : "在沙盒中运行测试"}</span>
                </button>
              </div>

              {testOutput && (
                <div>
                  <label className="block text-neutral-800 dark:text-slate-300 font-mono mb-1 font-bold">Output JSON 响应结果</label>
                  <pre className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-emerald-400 text-xs sm:text-sm overflow-x-auto leading-relaxed">
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
