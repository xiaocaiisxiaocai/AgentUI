import React, { useState } from "react";
import {
  X,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  Table,
  Plus,
  Trash2,
  Save,
  Play
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { KnowledgeSource, FieldMapping } from "../types";

interface SyncJobsModalProps {
  source?: KnowledgeSource;
  onClose: () => void;
}

export const SyncJobsModal: React.FC<SyncJobsModalProps> = ({ source, onClose }) => {
  const { syncJobs, updateFieldMappings, triggerSyncJob } = useAppStore();

  const [activeTab, setActiveTab] = useState<"jobs" | "mapping">("jobs");

  // Field Mappings state
  const defaultMappings: FieldMapping[] = source?.fieldMappings || [
    { sourceField: "FAULT_ID", targetField: "id", dataType: "string", isPrimaryKey: true },
    { sourceField: "DEVICE_CODE", targetField: "deviceCode", dataType: "string" },
    { sourceField: "ERROR_SYMPTOM", targetField: "content", dataType: "string" },
    { sourceField: "SOLUTION_STEPS", targetField: "solution", dataType: "string" },
    { sourceField: "CREATED_DATE", targetField: "createdAt", dataType: "date" },
  ];

  const [mappings, setMappings] = useState<FieldMapping[]>(defaultMappings);

  const handleAddField = () => {
    setMappings([
      ...mappings,
      { sourceField: "NEW_COLUMN", targetField: "extraField", dataType: "string" },
    ]);
  };

  const handleRemoveField = (idx: number) => {
    setMappings(mappings.filter((_, i) => i !== idx));
  };

  const handleSaveMappings = () => {
    if (source) {
      updateFieldMappings(source.id, mappings);
      alert("已更新 IPMS/数据库源字段映射拓扑配置！");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#111115]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-slate-100">
                {source ? `${source.name} - 数据同步与映射中心` : "数据源同步任务与失败分析"}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">RAG 层级 (KnowledgeBase → Source → Document → Chunk) 的真实数据管道</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900 text-xs sm:text-sm font-mono">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 py-3 font-bold border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-blue-600 text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                : "border-transparent text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            同步任务历史 & 失败记录
          </button>

          <button
            onClick={() => setActiveTab("mapping")}
            className={`flex-1 py-3 font-bold border-b-2 transition-colors ${
              activeTab === "mapping"
                ? "border-amber-600 text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                : "border-transparent text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            IPMS / 数据库字段映射 (Field Mapping)
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          {activeTab === "jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 dark:text-slate-300 font-mono">历史 Sync Job 执行日志 ({syncJobs.length})</span>
                {source && (
                  <button
                    onClick={() => triggerSyncJob(source.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs sm:text-sm flex items-center space-x-1 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>即刻发起增量同步</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {syncJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/80 space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center space-x-2">
                        {job.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        {job.status === "failed" && <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                        {job.status === "running" && <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />}
                        <span className="font-bold text-neutral-900 dark:text-slate-200">{job.sourceName}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          job.status === "completed"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-transparent"
                            : job.status === "failed"
                            ? "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-transparent"
                            : "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-transparent"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-neutral-600 dark:text-slate-400 font-mono text-xs sm:text-sm">
                      <span>总数: <strong className="text-neutral-900 dark:text-slate-200">{job.totalDocs}</strong></span>
                      <span>已切片: <strong className="text-emerald-700 dark:text-emerald-400">{job.syncedDocs}</strong></span>
                      <span>失败: <strong className="text-red-700 dark:text-red-400">{job.failedDocs}</strong></span>
                      <span>时间: {job.timestamp}</span>
                    </div>

                    {job.errorMessage && (
                      <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-red-900 dark:text-red-300 font-mono text-xs leading-relaxed">
                        ⚠️ 失败根因: {job.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-slate-200 text-xs sm:text-sm">数据库源与向量 Chunk 字段对齐拓扑</h3>
                  <p className="text-neutral-500 dark:text-slate-400 text-xs font-sans">配置 IPMS 关系数据库源的列对应到向量嵌入 (Embedding) 索引的对应 Target 字段</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddField}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/5 font-mono text-xs sm:text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增映射列</span>
                  </button>

                  <button
                    onClick={handleSaveMappings}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs sm:text-sm flex items-center space-x-1 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存映射配置</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden bg-neutral-50 dark:bg-black font-mono">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-slate-400 border-b border-neutral-200 dark:border-white/10 font-bold">
                    <tr>
                      <th className="p-3">数据库源列 (Source Field)</th>
                      <th className="p-3">知识 Chunk 字段 (Target Field)</th>
                      <th className="p-3">类型 (Data Type)</th>
                      <th className="p-3">主键标识</th>
                      <th className="p-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-white/10 text-neutral-900 dark:text-slate-200">
                    {mappings.map((m, idx) => (
                      <tr key={idx} className="hover:bg-neutral-100 dark:hover:bg-white/5">
                        <td className="p-3">
                          <input
                            type="text"
                            value={m.sourceField}
                            onChange={(e) => {
                              const copy = [...mappings];
                              copy[idx].sourceField = e.target.value;
                              setMappings(copy);
                            }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 rounded px-2 py-1 text-neutral-900 dark:text-slate-100 font-mono w-full"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={m.targetField}
                            onChange={(e) => {
                              const copy = [...mappings];
                              copy[idx].targetField = e.target.value;
                              setMappings(copy);
                            }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 rounded px-2 py-1 text-blue-700 dark:text-blue-300 font-bold font-mono w-full"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={m.dataType}
                            onChange={(e) => {
                              const copy = [...mappings];
                              copy[idx].dataType = e.target.value as any;
                              setMappings(copy);
                            }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 rounded px-2 py-1 text-neutral-800 dark:text-slate-300 font-mono"
                          >
                            <option value="string">string</option>
                            <option value="number">number</option>
                            <option value="date">date</option>
                            <option value="boolean">boolean</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={m.isPrimaryKey || false}
                            onChange={(e) => {
                              const copy = [...mappings];
                              copy[idx].isPrimaryKey = e.target.checked;
                              setMappings(copy);
                            }}
                            className="accent-amber-500 rounded"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveField(idx)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
