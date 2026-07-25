import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  Key,
  Info
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { UserRole } from "../types";

export const RbacPage: React.FC = () => {
  const { rbacRoles, userRole, setUserRole } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  const currentRoleObj = rbacRoles.find((r) => r.id === selectedRole) || rbacRoles[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span>RBAC 企业权限与隔离矩阵 (RBAC & Access Security Matrix)</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
          实现跨部门数据安全隔离、Agent 编辑/发布准入、知识库只读隔离与敏感 API 写操作审计权控制。
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rbacRoles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 rounded-2xl border cursor-pointer space-y-2 transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 shadow-md font-bold"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] text-neutral-700 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-900 dark:text-slate-100 font-bold">{role.name.split(" ")[0]}</span>
                {role.id === userRole && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold">
                    当前生效
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">{role.description}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Role Capabilities Detailed Matrix */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
              <span>{currentRoleObj.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 mt-0.5 font-sans">{currentRoleObj.description}</p>
          </div>

          <button
            onClick={() => setUserRole(selectedRole)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm font-mono transition-colors shrink-0 shadow-md"
          >
            应用此角色作为试用身份
          </button>
        </div>

        {/* Matrix Table */}
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden bg-neutral-50 dark:bg-black font-mono text-xs sm:text-sm">
          <table className="w-full text-left">
            <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-slate-400 border-b border-neutral-200 dark:border-white/10 font-bold">
              <tr>
                <th className="p-3.5">资源模块 (Resource Module)</th>
                <th className="p-3.5">可执行动作特权 (Action Permissions)</th>
                <th className="p-3.5">隔离级别 (Isolation Scope)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-white/10 text-neutral-900 dark:text-slate-200">
              {Object.entries(currentRoleObj.permissions).map(([moduleName, actions]) => (
                <tr key={moduleName} className="hover:bg-neutral-100 dark:hover:bg-white/5">
                  <td className="p-3.5 font-bold capitalize text-emerald-700 dark:text-emerald-400">{moduleName}</td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {actions.map((act) => (
                        <span key={act} className="px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold">
                          ✓ {act}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-neutral-600 dark:text-slate-400">
                    {selectedRole === "admin" ? "全域跨部门控制" : "本试点部门独立隔离"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
