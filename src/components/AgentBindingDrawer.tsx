import React, { useState } from "react";
import {
  X,
  Database,
  Wrench,
  Bot,
  CheckCircle2,
  Plus,
  ShieldAlert,
  GitBranch,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  FileText
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { AgentDefinition, AgentVersion, CircuitBreakerConfig } from "../types";

interface AgentBindingDrawerProps {
  agent: AgentDefinition;
  onClose: () => void;
}

export const AgentBindingDrawer: React.FC<AgentBindingDrawerProps> = ({ agent, onClose }) => {
  const {
    knowledgeBases,
    tools,
    agents,
    toggleAgentKnowledgeBase,
    toggleAgentTool,
    toggleAgentChildAgent,
    updateAgentVersion,
    updateAgentCircuitBreaker,
    updateAgent
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"bindings" | "versions" | "circuit">("bindings");
  const [newVersionNum, setNewVersionNum] = useState("v" + (parseFloat(agent.version.replace("v", "")) + 0.1).toFixed(1));
  const [changelogText, setChangelogText] = useState("");
  const [releaseStatus, setReleaseStatus] = useState<"draft" | "staging" | "production">("staging");

  // Circuit Breaker State
  const [cbEnabled, setCbEnabled] = useState(agent.circuitBreaker?.enabled ?? false);
  const [cbThreshold, setCbThreshold] = useState(agent.circuitBreaker?.failureThreshold ?? 3);
  const [cbResetTimeout, setCbResetTimeout] = useState(agent.circuitBreaker?.resetTimeoutSec ?? 60);
  const [cbFallbackAgentId, setCbFallbackAgentId] = useState(agent.circuitBreaker?.fallbackAgentId ?? "");
  const [cbFallbackMsg, setCbFallbackMsg] = useState(agent.circuitBreaker?.fallbackMessage ?? "系统触发熔断保护，已切换至备份兜底 Agent 提供人机兜底回复。");

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changelogText.trim()) return;

    const newVer: AgentVersion = {
      version: newVersionNum,
      releaseStatus,
      changelog: changelogText.trim(),
      author: "管理员 (Admin)",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    updateAgentVersion(agent.id, newVer);
    setChangelogText("");
  };

  const handleSaveCircuitBreaker = () => {
    const config: CircuitBreakerConfig = {
      enabled: cbEnabled,
      failureThreshold: cbThreshold,
      resetTimeoutSec: cbResetTimeout,
      fallbackAgentId: cbFallbackAgentId || undefined,
      fallbackMessage: cbFallbackMsg
    };
    updateAgentCircuitBreaker(agent.id, config);
    alert("已成功保存 Agent 熔断与降级防护配置！");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-2xl border-l border-neutral-200 dark:border-white/10 flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#111115]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>{agent.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {agent.version}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{agent.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 dark:border-white/10 bg-neutral-900 text-xs font-mono">
          <button
            onClick={() => setActiveTab("bindings")}
            className={`flex-1 py-3 border-b-2 font-bold transition-colors ${
              activeTab === "bindings"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            企业资源绑定 (RAG/Tools/Sub-Agents)
          </button>

          <button
            onClick={() => setActiveTab("versions")}
            className={`flex-1 py-3 border-b-2 font-bold transition-colors ${
              activeTab === "versions"
                ? "border-purple-500 text-purple-400 bg-purple-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            版本控制 & 状态发布
          </button>

          <button
            onClick={() => setActiveTab("circuit")}
            className={`flex-1 py-3 border-b-2 font-bold transition-colors ${
              activeTab === "circuit"
                ? "border-amber-500 text-amber-400 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            熔断与 Fallback 降级
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BINDINGS */}
          {activeTab === "bindings" && (
            <div className="space-y-6">
              {/* Bound Knowledge Bases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs font-mono text-blue-400 flex items-center space-x-1.5">
                    <Database className="w-4 h-4" />
                    <span>知识库 (Knowledge Bases) 关联 - [{agent.knowledgeBaseIds.length}]</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {knowledgeBases.map((kb) => {
                    const isBound = agent.knowledgeBaseIds.includes(kb.id);
                    return (
                      <div
                        key={kb.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isBound
                            ? "border-blue-500/50 bg-blue-500/10 text-slate-100"
                            : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0f0f12] text-slate-400 opacity-80"
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs">{kb.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({kb.docCount} 份文档 | {kb.chunkCount} 切片)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{kb.description}</p>
                        </div>

                        <button
                          onClick={() => toggleAgentKnowledgeBase(agent.id, kb.id)}
                          className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-colors ${
                            isBound
                              ? "bg-blue-600 text-white"
                              : "border border-white/10 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {isBound ? "已绑定" : "+ 绑定"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bound Tools */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
                    <Wrench className="w-4 h-4" />
                    <span>使用工具 (Tools & APIs) 关联 - [{agent.toolIds.length}]</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {tools.map((tl) => {
                    const isBound = agent.toolIds.includes(tl.id);
                    return (
                      <div
                        key={tl.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isBound
                            ? "border-emerald-500/50 bg-emerald-500/10 text-slate-100"
                            : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0f0f12] text-slate-400 opacity-80"
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs">{tl.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400">
                              {tl.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{tl.description}</p>
                        </div>

                        <button
                          onClick={() => toggleAgentTool(agent.id, tl.id)}
                          className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-colors ${
                            isBound
                              ? "bg-emerald-600 text-white"
                              : "border border-white/10 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {isBound ? "已绑定" : "+ 绑定"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bound Sub Agents */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs font-mono text-purple-400 flex items-center space-x-1.5">
                    <Bot className="w-4 h-4" />
                    <span>协同子 Agent (Child Sub-Agents) - [{agent.childAgentIds.length}]</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {agents
                    .filter((a) => a.id !== agent.id)
                    .map((child) => {
                      const isBound = agent.childAgentIds.includes(child.id);
                      return (
                        <div
                          key={child.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                            isBound
                              ? "border-purple-500/50 bg-purple-500/10 text-slate-100"
                              : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0f0f12] text-slate-400 opacity-80"
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs">{child.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                ({child.type} | {child.department})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{child.description}</p>
                          </div>

                          <button
                            onClick={() => toggleAgentChildAgent(agent.id, child.id)}
                            className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-colors ${
                              isBound
                                ? "bg-purple-600 text-white"
                                : "border border-white/10 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {isBound ? "已绑定" : "+ 绑定"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERSIONS */}
          {activeTab === "versions" && (
            <div className="space-y-6">
              {/* Create New Version Form */}
              <form onSubmit={handleSaveVersion} className="p-4 rounded-xl border border-white/10 bg-neutral-900 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-purple-300 flex items-center space-x-1.5">
                  <GitBranch className="w-4 h-4" />
                  <span>发布 Agent 新版本 (Draft / Staging / Production)</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">版本号</label>
                    <input
                      type="text"
                      value={newVersionNum}
                      onChange={(e) => setNewVersionNum(e.target.value)}
                      className="w-full p-2 rounded bg-black border border-white/10 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">发布目标环境</label>
                    <select
                      value={releaseStatus}
                      onChange={(e) => setReleaseStatus(e.target.value as any)}
                      className="w-full p-2 rounded bg-black border border-white/10 text-slate-100 font-mono"
                    >
                      <option value="draft">Draft (草案测试)</option>
                      <option value="staging">Staging (预发布灰度)</option>
                      <option value="production">Production (生产环境)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">版本 Changelog 变更日志</label>
                  <textarea
                    rows={2}
                    value={changelogText}
                    onChange={(e) => setChangelogText(e.target.value)}
                    placeholder="如：优化了工业设备 504 故障 Prompt 逻辑，增补了写操作拦截卡片..."
                    className="w-full p-2 rounded bg-black border border-white/10 text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!changelogText.trim()}
                  className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold font-mono transition-colors"
                >
                  确认发布新版本
                </button>
              </form>

              {/* Version History List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs font-mono text-slate-300">历史版本回滚日志</h4>
                {(!agent.versions || agent.versions.length === 0) ? (
                  <p className="text-xs text-slate-500 font-mono">暂无历史归档版本。</p>
                ) : (
                  agent.versions.map((ver, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-white/10 bg-neutral-900/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300 font-mono">{ver.version}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {ver.releaseStatus}
                        </span>
                      </div>
                      <p className="text-slate-300">{ver.changelog}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                        <span>发布人: {ver.author} | {ver.createdAt}</span>
                        <button
                          onClick={() => {
                            updateAgent({ ...agent, version: ver.version });
                            alert(`已迅速回滚 Agent 版本至 ${ver.version}！`);
                          }}
                          className="text-amber-400 hover:underline flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>一键回滚到此版本</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CIRCUIT BREAKER */}
          {activeTab === "circuit" && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Agent 自动熔断器与兜底降级策略 (Circuit Breaker)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  当上游模型 API 发生高时延、网络中断或连续抛错时，熔断机制将自动拦截请求并转交至备份兜底 Agent，防止系统级雪崩。
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-neutral-900">
                  <div>
                    <span className="block font-bold text-slate-200">启用自动熔断保护 (Enable Circuit Breaker)</span>
                    <span className="text-[11px] text-slate-400">检测到连续失败后自动断开上游链接</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cbEnabled}
                    onChange={(e) => setCbEnabled(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">连续失败阈值 (Failure Threshold)</label>
                    <input
                      type="number"
                      value={cbThreshold}
                      onChange={(e) => setCbThreshold(parseInt(e.target.value) || 1)}
                      className="w-full p-2 rounded bg-black border border-white/10 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">熔断重置冷却秒数 (Reset Timeout Sec)</label>
                    <input
                      type="number"
                      value={cbResetTimeout}
                      onChange={(e) => setCbResetTimeout(parseInt(e.target.value) || 30)}
                      className="w-full p-2 rounded bg-black border border-white/10 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">备份兜底 Agent (Fallback Agent)</label>
                  <select
                    value={cbFallbackAgentId}
                    onChange={(e) => setCbFallbackAgentId(e.target.value)}
                    className="w-full p-2 rounded bg-black border border-white/10 text-slate-100 font-mono"
                  >
                    <option value="">未指定 (使用默认提示词静态回复)</option>
                    {agents
                      .filter((a) => a.id !== agent.id)
                      .map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.type})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">静态兜底提示文案 (Fallback Message)</label>
                  <textarea
                    rows={3}
                    value={cbFallbackMsg}
                    onChange={(e) => setCbFallbackMsg(e.target.value)}
                    className="w-full p-2 rounded bg-black border border-white/10 text-slate-100"
                  />
                </div>

                <button
                  onClick={handleSaveCircuitBreaker}
                  className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold font-mono transition-colors"
                >
                  保存熔断配置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
