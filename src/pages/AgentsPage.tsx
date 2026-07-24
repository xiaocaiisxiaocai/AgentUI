import React, { useState } from "react";
import {
  Bot,
  Plus,
  Cloud,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  Database,
  Wrench,
  Layers,
  Settings,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  Radio
} from "lucide-react";
import { AgentDefinition, AppLanguage, KnowledgeBase, ToolDefinition } from "../types";
import { ExternalAgentModal } from "./ExternalAgentModal";

interface AgentsPageProps {
  agents: AgentDefinition[];
  onAddAgent: (agent: AgentDefinition) => void;
  onUpdateAgent: (agent: AgentDefinition) => void;
  onSelectAgentForChat: (agentId: string) => void;
  knowledgeBases: KnowledgeBase[];
  tools: ToolDefinition[];
  lang: AppLanguage;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  agents,
  onAddAgent,
  onUpdateAgent,
  onSelectAgentForChat,
  knowledgeBases,
  tools,
}) => {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<AgentDefinition | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "config" | "kb" | "tools" | "children">("overview");

  const agentTypes = [
    "All",
    "Internal",
    "External",
    "Supervisor",
    "Specialist",
    "Workflow",
    "HumanAssisted"
  ];

  const filteredAgents = agents.filter((a) => {
    const matchesType = selectedType === "All" || a.type === selectedType;
    const matchesQuery =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Bot className="w-6 h-6 text-blue-400" />
            <span>Agent 中心 (Agent Hub & Registry)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            统一管理内置 Agent、专家 Agent、多 Agent Supervisor 及 A2A / Dify / LangGraph 外部 Agent 接入。
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowExternalModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-xs shadow-xs transition-colors"
          >
            <Cloud className="w-4 h-4" />
            <span>接入外部 Agent</span>
          </button>

          <button
            onClick={() => {
              const newAgent: AgentDefinition = {
                id: "agent-" + Date.now(),
                name: "新建自定义业务 Agent",
                description: "针对特定部门或业务流程定制的 AI Agent",
                icon: "Bot",
                type: "Specialist",
                department: "售后技术部",
                status: "active",
                version: "v1.0.0",
                model: "Gemini 3.6 Flash",
                systemPrompt: "你是一个专业的业务 Agent。",
                planningMode: "auto",
                knowledgeBaseIds: ["kb-ipms-history"],
                toolIds: ["tool-ipms-query"],
                childAgentIds: [],
                connectorIds: [],
                workflowIds: [],
                successRate: 100,
                totalRuns: 0,
                lastRunTime: "刚刚",
              };
              onAddAgent(newAgent);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>新建 Agent</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs">
          {agentTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg font-mono transition-all whitespace-nowrap ${
                selectedType === t
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "bg-white dark:bg-[#121215] text-slate-400 hover:text-white border border-neutral-200 dark:border-white/10"
              }`}
            >
              {t === "All" ? `全部 Agent (${agents.length})` : t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索 Agent 名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className={`p-5 rounded-xl border bg-white dark:bg-[#0d0d10] shadow-sm flex flex-col justify-between space-y-4 transition-all hover:border-blue-500/40 relative ${
              agent.isExternal
                ? "border-purple-500/30"
                : "border-neutral-200 dark:border-white/10"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      agent.isExternal
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {agent.isExternal ? <Cloud className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                      {agent.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {agent.department} | {agent.version}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    agent.type === "Supervisor"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : agent.isExternal
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {agent.type}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {agent.description}
              </p>

              {/* Resource Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-slate-400 flex items-center space-x-1">
                  <Database className="w-3 h-3 text-blue-400" />
                  <span>知识库 ({agent.knowledgeBaseIds.length})</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-slate-400 flex items-center space-x-1">
                  <Wrench className="w-3 h-3 text-amber-400" />
                  <span>工具 ({agent.toolIds.length})</span>
                </span>
                {agent.childAgentIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-purple-400" />
                    <span>子 Agent ({agent.childAgentIds.length})</span>
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="text-[10px] font-mono text-slate-400">
                模型: <span className="text-slate-200 font-bold">{agent.model}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedAgentDetail(agent)}
                  className="px-2.5 py-1 rounded border border-neutral-200 dark:border-white/10 text-slate-300 hover:bg-white/5 font-mono text-xs"
                >
                  配置
                </button>
                <button
                  onClick={() => onSelectAgentForChat(agent.id)}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 shadow-xs"
                >
                  <span>对话</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* External Agent Modal */}
      <ExternalAgentModal
        isOpen={showExternalModal}
        onClose={() => setShowExternalModal(false)}
        onAddAgent={onAddAgent}
      />

      {/* Agent Detail & Config Drawer */}
      {selectedAgentDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-[#121215] h-full shadow-2xl flex flex-col p-6 space-y-5 overflow-y-auto border-l border-neutral-200 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-4">
              <div className="flex items-center space-x-2.5">
                <Bot className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    {selectedAgentDetail.name}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedAgentDetail.department} | {selectedAgentDetail.version}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgentDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config Tabs */}
            <div className="flex items-center border-b border-white/10 font-mono text-xs space-x-4">
              <button
                onClick={() => setDetailTab("overview")}
                className={`py-2 border-b-2 font-bold ${
                  detailTab === "overview" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400"
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setDetailTab("config")}
                className={`py-2 border-b-2 font-bold ${
                  detailTab === "config" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400"
                }`}
              >
                行为配置
              </button>
              <button
                onClick={() => setDetailTab("kb")}
                className={`py-2 border-b-2 font-bold ${
                  detailTab === "kb" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400"
                }`}
              >
                知识库绑定 ({selectedAgentDetail.knowledgeBaseIds.length})
              </button>
              <button
                onClick={() => setDetailTab("tools")}
                className={`py-2 border-b-2 font-bold ${
                  detailTab === "tools" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400"
                }`}
              >
                工具绑定 ({selectedAgentDetail.toolIds.length})
              </button>
            </div>

            {/* Tab Details */}
            {detailTab === "overview" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-white/10 bg-neutral-900 space-y-2">
                  <div className="font-bold text-slate-200">System Prompt</div>
                  <pre className="p-3 rounded bg-black font-mono text-blue-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {selectedAgentDetail.systemPrompt}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300 font-mono">
                  <div className="p-3 rounded border border-white/10 bg-neutral-900">
                    <span className="text-slate-400 block text-[10px]">成功率</span>
                    <span className="text-base font-bold text-emerald-400">{selectedAgentDetail.successRate}%</span>
                  </div>
                  <div className="p-3 rounded border border-white/10 bg-neutral-900">
                    <span className="text-slate-400 block text-[10px]">总运行次数</span>
                    <span className="text-base font-bold text-blue-400">{selectedAgentDetail.totalRuns} 次</span>
                  </div>
                </div>
              </div>
            )}

            {detailTab === "config" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Planning Mode (规划模式)</label>
                  <select
                    value={selectedAgentDetail.planningMode}
                    onChange={(e) => {
                      const updated = { ...selectedAgentDetail, planningMode: e.target.value as any };
                      setSelectedAgentDetail(updated);
                      onUpdateAgent(updated);
                    }}
                    className="w-full px-3 py-2 rounded border border-white/10 bg-neutral-900 text-slate-100"
                  >
                    <option value="auto">Auto (自动拆解意图与调度)</option>
                    <option value="react">ReAct (Reasoning + Acting 循环)</option>
                    <option value="plan_and_execute">Plan-and-Execute (先拆解图谱后依次执行)</option>
                    <option value="sequential">Sequential (顺序线性流水线)</option>
                  </select>
                </div>
              </div>
            )}

            {detailTab === "kb" && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">选择该 Agent 可直接进行 RAG 向量检索的部门知识库：</p>
                {knowledgeBases.map((kb) => {
                  const isBound = selectedAgentDetail.knowledgeBaseIds.includes(kb.id);
                  return (
                    <div
                      key={kb.id}
                      onClick={() => {
                        const newKbIds = isBound
                          ? selectedAgentDetail.knowledgeBaseIds.filter((id) => id !== kb.id)
                          : [...selectedAgentDetail.knowledgeBaseIds, kb.id];
                        const updated = { ...selectedAgentDetail, knowledgeBaseIds: newKbIds };
                        setSelectedAgentDetail(updated);
                        onUpdateAgent(updated);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between ${
                        isBound
                          ? "border-blue-500 bg-blue-500/10 font-bold text-blue-300"
                          : "border-white/10 bg-neutral-900 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="text-slate-200">{kb.name}</div>
                        <div className="text-[10px] text-slate-400">{kb.department} | {kb.docCount} 文档</div>
                      </div>
                      {isBound && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                  );
                })}
              </div>
            )}

            {detailTab === "tools" && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">选择该 Agent 能够调用的系统工具与函数：</p>
                {tools.map((tl) => {
                  const isBound = selectedAgentDetail.toolIds.includes(tl.id);
                  return (
                    <div
                      key={tl.id}
                      onClick={() => {
                        const newToolIds = isBound
                          ? selectedAgentDetail.toolIds.filter((id) => id !== tl.id)
                          : [...selectedAgentDetail.toolIds, tl.id];
                        const updated = { ...selectedAgentDetail, toolIds: newToolIds };
                        setSelectedAgentDetail(updated);
                        onUpdateAgent(updated);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between ${
                        isBound
                          ? "border-amber-500 bg-amber-500/10 font-bold text-amber-300"
                          : "border-white/10 bg-neutral-900 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="text-slate-200">{tl.name}</div>
                        <div className="text-[10px] text-slate-400">{tl.type} | {tl.department}</div>
                      </div>
                      {isBound && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedAgentDetail(null)}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
