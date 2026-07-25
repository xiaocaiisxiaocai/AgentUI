import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  UserCheck,
  Search,
  Check,
  X
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export const ApprovalsPage: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const { approvals, approveRequest, rejectRequest } = useAppStore();
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (paramId) {
      setSearchQuery(paramId);
      setFilterStatus("all");
    }
  }, [paramId]);

  const filteredApprovals = approvals.filter((app) => {
    if (paramId && app.id === paramId) return true;
    const matchesRisk = filterRisk === "all" || app.riskLevel === filterRisk;
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesQuery =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.actionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesStatus && matchesQuery;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Page Top Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>人工关卡与待办审批中心 (Human-in-the-Loop Approval Hub)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            拦截高风险 Agent 行为（如写数据库、提交真正工单、对外发送邮件、执行危险脚本），由责任人核验风险后再行放行。
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b]">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 dark:text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索待办操作 ID / 名称 / Agent..."
              className="pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-xs sm:text-sm text-neutral-900 dark:text-slate-100 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 font-mono w-60"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-xs sm:text-sm text-neutral-800 dark:text-slate-200 font-mono font-bold"
          >
            <option value="pending">待处理 (Pending)</option>
            <option value="approved">已批准 (Approved)</option>
            <option value="rejected">已拒绝 (Rejected)</option>
            <option value="all">全部状态</option>
          </select>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-xs sm:text-sm text-neutral-800 dark:text-slate-200 font-mono font-bold"
          >
            <option value="all">所有风险等级</option>
            <option value="high">高风险 (High)</option>
            <option value="medium">中风险 (Medium)</option>
            <option value="low">低风险 (Low)</option>
          </select>
        </div>

        <span className="text-xs sm:text-sm font-mono text-neutral-500 dark:text-slate-400">
          共计 <strong className="text-neutral-900 dark:text-slate-200">{filteredApprovals.length}</strong> 条记录
        </span>
      </div>

      {/* Approvals Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl text-neutral-500 dark:text-slate-500 font-mono text-xs sm:text-sm">
            暂无符合条件的待办审批申请
          </div>
        ) : (
          filteredApprovals.map((req) => (
            <div
              key={req.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-sm ${
                req.id === paramId
                  ? "border-amber-500 ring-2 ring-amber-400/30 bg-amber-50 dark:bg-amber-500/5"
                  : req.status === "pending"
                  ? "border-amber-300 dark:border-amber-500/40 bg-white dark:bg-[#0d0d10]"
                  : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-white/5 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      req.riskLevel === "high"
                        ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                        : req.riskLevel === "medium"
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                        : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                    }`}
                  >
                    {req.riskLevel.toUpperCase()} RISK
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm lg:text-base text-neutral-900 dark:text-slate-100">{req.actionTitle}</h3>
                  <span className="text-xs font-mono text-neutral-500 dark:text-slate-500">({req.id})</span>
                </div>

                <div className="flex items-center space-x-3 text-xs sm:text-sm font-mono text-neutral-600 dark:text-slate-400">
                  <span>发起 Agent: <strong className="text-neutral-900 dark:text-slate-200">{req.agentName}</strong></span>
                  <span>申请时间: {req.timestamp}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 dark:text-slate-300 leading-relaxed font-sans">{req.description}</p>

              {/* Params JSON Payload */}
              <div className="space-y-1 font-mono">
                <label className="block text-xs font-mono text-neutral-600 dark:text-slate-400 font-bold">捕获的写调用参数 Payload:</label>
                <pre className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-300 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
                  {JSON.stringify(req.params, null, 2)}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs sm:text-sm font-mono text-neutral-600 dark:text-slate-400">
                  当前状态:{" "}
                  <strong
                    className={
                      req.status === "approved"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : req.status === "rejected"
                        ? "text-red-600 dark:text-red-400"
                        : "text-amber-600 dark:text-amber-400"
                    }
                  >
                    {req.status.toUpperCase()}
                  </strong>
                </span>

                {req.status === "pending" && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold font-mono text-xs sm:text-sm flex items-center space-x-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>拒绝执行</span>
                    </button>

                    <button
                      onClick={() => approveRequest(req.id)}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold font-mono text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>人工批准并放行</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
