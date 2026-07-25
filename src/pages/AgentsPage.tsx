import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bot,
  Plus,
  Cloud,
  Search,
  CheckCircle2,
  Database,
  Wrench,
  Layers,
  ArrowRight,
  ShieldAlert,
  GitBranch
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { AgentDefinition } from "../types";
import { AgentBindingDrawer } from "../components/AgentBindingDrawer";
import { ExternalAgentWizardModal } from "../components/ExternalAgentWizardModal";

export const AgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id?: string }>();
  const { agents, addAgent, setCurrentAgentId } = useAppStore();

  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [selectedAgentForBinding, setSelectedAgentForBinding] = useState<AgentDefinition | null>(null);

  useEffect(() => {
    if (paramId) {
      const found = agents.find((a) => a.id === paramId);
      if (found) {
        setSelectedAgentForBinding(found);
      }
    }
  }, [paramId, agents]);

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

  const handleSelectChat = (id: string) => {
    setCurrentAgentId(id);
    navigate("/workspace");
  };

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
            统一管理内置 Agent、专家 Agent、多 Agent Supervisor 及 A2A / Dify / LangGraph 外部 Agent 接入向导。
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowWizardModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-xs shadow-xs transition-colors"
          >
            <Cloud className="w-4 h-4" />
            <span>接入外部 Agent (向导)</span>
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
                version: "v1.0",
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
              addAgent(newAgent);
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
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs sm:text-sm">
          {agentTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg font-mono transition-all whitespace-nowrap text-xs sm:text-sm ${
                selectedType === t
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "bg-white dark:bg-[#121215] text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/10"
              }`}
            >
              {t === "All" ? `全部 Agent (${agents.length})` : t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="搜索 Agent 名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] text-xs sm:text-sm text-neutral-900 dark:text-slate-100 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500"
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
                ? "border-purple-300 dark:border-purple-500/30"
                : "border-neutral-200 dark:border-white/10"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      agent.isExternal
                        ? "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
                        : "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                    }`}
                  >
                    {agent.isExternal ? <Cloud className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100 line-clamp-1">
                      {agent.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-neutral-500 dark:text-slate-400 mt-0.5">
                      <span>{agent.department}</span>
                      <span>|</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{agent.version}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                      agent.type === "Supervisor"
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                        : agent.isExternal
                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                        : "bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    }`}
                  >
                    {agent.type}
                  </span>

                  {agent.circuitBreaker?.enabled && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>熔断保护</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                {agent.description}
              </p>

              {/* Resource Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-slate-300 flex items-center space-x-1 border border-neutral-200 dark:border-white/5">
                  <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>知识库 ({agent.knowledgeBaseIds.length})</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-slate-300 flex items-center space-x-1 border border-neutral-200 dark:border-white/5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>工具 ({agent.toolIds.length})</span>
                </span>
                {agent.childAgentIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 flex items-center space-x-1 border border-purple-200 dark:border-purple-500/20">
                    <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>子 Agent ({agent.childAgentIds.length})</span>
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between text-xs sm:text-sm">
              <div className="text-xs font-mono text-neutral-500 dark:text-slate-400">
                模型: <span className="text-neutral-900 dark:text-slate-200 font-bold">{agent.model}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedAgentForBinding(agent)}
                  className="px-2.5 py-1 rounded border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/5 font-mono text-xs sm:text-sm flex items-center space-x-1 font-semibold"
                >
                  <GitBranch className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>绑定与版本</span>
                </button>
                <button
                  onClick={() => handleSelectChat(agent.id)}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-1 shadow-xs"
                >
                  <span>对话</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* External Agent Multi-Step Wizard Modal */}
      {showWizardModal && (
        <ExternalAgentWizardModal onClose={() => setShowWizardModal(false)} />
      )}

      {/* Agent Resource Binding & Version Drawer */}
      {selectedAgentForBinding && (
        <AgentBindingDrawer
          agent={selectedAgentForBinding}
          onClose={() => setSelectedAgentForBinding(null)}
        />
      )}
    </div>
  );
};
