import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Bot,
  Workflow,
  Sparkles,
  Terminal,
  Activity,
  Sliders,
  X
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { BuiltInModule } from "../types";

export const ModulesPage: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { modules, addModule } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<BuiltInModule | null>(
    modules.find((m) => m.id === paramId) || modules[0] || null
  );

  // Test Console State
  const [testPayload, setTestPayload] = useState<string>("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: "all", label: "全部模组" },
    { id: "基础模组", label: "基础模组" },
    { id: "RAG 模组", label: "RAG 模组" },
    { id: "Agent 模组", label: "Agent 模组" },
    { id: "数据处理模组", label: "数据处理模组" },
    { id: "企业模组", label: "企业模组" },
  ];

  const filteredModules = modules.filter((m) => {
    const matchesCategory = activeCategory === "all" || m.category === activeCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectModule = (mod: BuiltInModule) => {
    setSelectedModule(mod);
    setTestPayload(mod.inputSchema);
    setTestResult(null);
    navigate(`/modules/${mod.id}`, { replace: true });
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(
        JSON.stringify(
          {
            status: "SUCCESS",
            executionTimeMs: 42,
            output: JSON.parse(selectedModule?.outputSchema || "{}"),
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
    }, 500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>内置模组中心 (Built-in Capability Modules)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            企业级可复用 Agent 能力组件库，包含 5 大类共 40+ atomic 原子模组，支持在 Agent 和 DAG 工作流中任意绑定。
          </p>
        </div>

        <button
          onClick={() => {
            const newMod: BuiltInModule = {
              id: "mod-" + Date.now(),
              name: "Custom Agent Handoff Guard (自定义切向模组)",
              category: "Agent 模组",
              description: "处理跨部门 Agent 动态路由与跨域会话凭证继承。",
              inputSchema: "{\n  \"targetAgentId\": \"string\",\n  \"context\": \"object\"\n}",
              outputSchema: "{\n  \"handoffSuccess\": true\n}",
              configParams: { allowAutoReturn: true },
              version: "v1.0.0",
              status: "active",
              usedByAgents: ["主控 Agent"],
              usedByWorkflows: [],
            };
            addModule(newMod);
            handleSelectModule(newMod);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
        >
          + 注册自定义模组
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10]">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-neutral-400 dark:text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模组名称、功能与分类..."
            className="pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-xs sm:text-sm text-neutral-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono w-full md:w-64 placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Modules List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="font-bold text-xs sm:text-sm font-mono text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
            模组列表 ({filteredModules.length})
          </h3>
          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredModules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => handleSelectModule(mod)}
                className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                  selectedModule?.id === mod.id
                    ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/10 shadow-md ring-1 ring-indigo-500/40"
                    : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] hover:border-indigo-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    {mod.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">{mod.version}</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100 leading-snug">{mod.name}</h4>
                <p className="text-xs text-neutral-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Module Details & Playground */}
        {selectedModule && (
          <div className="lg:col-span-2 space-y-6">
            {/* Detail Card */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl space-y-5">
              <div className="flex items-start justify-between border-b border-neutral-200 dark:border-white/10 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {selectedModule.category}
                    </span>
                    <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">ID: {selectedModule.id}</span>
                  </div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-neutral-900 dark:text-slate-100 mt-2">{selectedModule.name}</h2>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center space-x-1 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedModule.status.toUpperCase()}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 dark:text-slate-300 leading-relaxed font-sans">{selectedModule.description}</p>

              {/* Bindings & Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 space-y-2">
                  <div className="font-bold text-neutral-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>已绑定 Agents ({selectedModule.usedByAgents.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModule.usedByAgents.map((ag) => (
                      <span key={ag} className="px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 font-mono text-xs font-bold border border-purple-200 dark:border-purple-500/20">
                        {ag}
                      </span>
                    ))}
                    {selectedModule.usedByAgents.length === 0 && (
                      <span className="text-xs text-neutral-400 italic">暂无 Agent 绑定</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 space-y-2">
                  <div className="font-bold text-neutral-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Workflow className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>已绑定 Workflows ({selectedModule.usedByWorkflows.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModule.usedByWorkflows.map((wf) => (
                      <span key={wf} className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-500/20">
                        {wf}
                      </span>
                    ))}
                    {selectedModule.usedByWorkflows.length === 0 && (
                      <span className="text-xs text-neutral-400 italic">暂无 Workflow 绑定</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Input / Output Schemas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-mono">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-neutral-800 dark:text-slate-200 font-bold">Input Schema Definition</label>
                    <button
                      onClick={() => handleCopy(selectedModule.inputSchema)}
                      className="text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200 flex items-center space-x-1 text-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-neutral-900 text-indigo-300 border border-neutral-800 overflow-x-auto h-36 text-xs sm:text-sm leading-relaxed">
                    {selectedModule.inputSchema}
                  </pre>
                </div>

                <div>
                  <label className="block text-neutral-800 dark:text-slate-200 font-bold mb-1.5">Output Schema Definition</label>
                  <pre className="p-3.5 rounded-xl bg-neutral-900 text-emerald-400 border border-neutral-800 overflow-x-auto h-36 text-xs sm:text-sm leading-relaxed">
                    {selectedModule.outputSchema}
                  </pre>
                </div>
              </div>

              {/* Config Parameters */}
              <div className="space-y-1.5 font-mono text-xs sm:text-sm">
                <label className="block text-neutral-800 dark:text-slate-200 font-bold">模组核心配置参数 (Config Parameters)</label>
                <pre className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-300 overflow-x-auto text-xs sm:text-sm leading-relaxed">
                  {JSON.stringify(selectedModule.configParams, null, 2)}
                </pre>
              </div>
            </div>

            {/* Test Console Playground */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>在线调试控制台 (Interactive Module Sandbox)</span>
                </h3>

                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shrink-0"
                >
                  <Play className={`w-4 h-4 ${isTesting ? "animate-spin" : ""}`} />
                  <span>{isTesting ? "运行校验中..." : "触发测试"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-mono">
                <div>
                  <label className="block text-neutral-600 dark:text-slate-400 mb-1.5 font-bold">输入测试数据 (Input Payload)</label>
                  <textarea
                    value={testPayload || selectedModule.inputSchema}
                    onChange={(e) => setTestPayload(e.target.value)}
                    rows={6}
                    className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-indigo-300 font-mono text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-slate-400 mb-1.5 font-bold">执行结果输出 (Execution Result)</label>
                  <pre className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto h-[152px] leading-relaxed">
                    {testResult || "// 点击“触发测试”运行单体模组推理及逻辑断言"}
                  </pre>
                </div>
              </div>

              {/* Execution Logs */}
              {selectedModule.logs && selectedModule.logs.length > 0 && (
                <div className="pt-3 border-t border-neutral-200 dark:border-white/5 space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-slate-300 font-mono flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>最新模组执行日志 Trace Logs</span>
                  </div>
                  <div className="space-y-1 font-mono text-xs sm:text-sm">
                    {selectedModule.logs.map((log, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-neutral-800 dark:text-slate-200">
                        <span className="text-neutral-500 dark:text-slate-400">[{log.timestamp}]</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">{log.status}</span>
                        <span>- {log.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
