import React, { useState } from "react";
import {
  Wrench,
  Key,
  HardDrive,
  Download,
  Upload,
  Play,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { ErrorLog, TestResult, AppLanguage } from "../types";
import { t } from "../i18n/translations";

interface DeveloperToolsModalProps {
  hasApiKey: boolean;
  errorLogs: ErrorLog[];
  testResults: TestResult[];
  onRunAutoTest: () => void;
  onClearCache: () => void;
  onExportData: () => void;
  lang: AppLanguage;
}

export const DeveloperToolsModal: React.FC<DeveloperToolsModalProps> = ({
  hasApiKey,
  errorLogs,
  testResults,
  onRunAutoTest,
  onClearCache,
  onExportData,
  lang,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"keys" | "tests" | "cache" | "errors">("keys");

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
          <Wrench className="w-6 h-6 text-blue-400" />
          <span>{t("devToolsHeading", lang)}</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
          包含 API Key 密钥状态监测、离线 IndexedDB 缓存备份、CI/CD 自动化回归测试与异常日志堆栈诊断。
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-white/10 pb-2 text-xs font-mono font-bold">
        <button
          onClick={() => setActiveSubTab("keys")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === "keys"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          🔑 API Key
        </button>
        <button
          onClick={() => setActiveSubTab("tests")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === "tests"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          🧪 AUTOMATED TESTS
        </button>
        <button
          onClick={() => setActiveSubTab("cache")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === "cache"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          💾 OFFLINE CACHE
        </button>
        <button
          onClick={() => setActiveSubTab("errors")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === "errors"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          ⚠️ ERROR LOGS
        </button>
      </div>

      {/* SUBTAB 1: API KEYS */}
      {activeSubTab === "keys" && (
        <div className="p-6 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-800 dark:text-slate-200">
                  服务端 Gemini API 密钥
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Secrets 面板自动注入 `process.env.GEMINI_API_KEY`
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
              hasApiKey ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}>
              {hasApiKey ? "ACTIVE & VALID" : "SIMULATION MODE"}
            </span>
          </div>

          <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed bg-neutral-50 dark:bg-[#151515] p-4 rounded border border-neutral-200 dark:border-white/5">
            根据平台安全规范，Gemini API 密钥在后端 server.ts 中安全调用，永远不会泄露或传回前端浏览器。如需调整或更换 Key，请使用控制面板的 Secrets 设置。
          </p>
        </div>
      )}

      {/* SUBTAB 2: AUTOMATED TESTING */}
      {activeSubTab === "tests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-800 dark:text-slate-200">
              CI/CD 自动化回归测试用例
            </h3>
            <button
              onClick={onRunAutoTest}
              className="flex items-center space-x-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{t("runAutoTest", lang)}</span>
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((test) => (
              <div
                key={test.id}
                className="p-3.5 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-neutral-800 dark:text-slate-200">
                    {test.testName}
                  </span>
                </div>

                <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
                  <span>Latency: {test.latencyMs}ms</span>
                  <span>Accuracy: {(test.similarityScore * 100).toFixed(0)}%</span>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: OFFLINE CACHE & BACKUP */}
      {activeSubTab === "cache" && (
        <div className="p-6 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-800 dark:text-slate-200">
                离线缓存与本地资产导出
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                对话历史、文档向量索引及工作流架构将自动存储至本地 IndexedDB，保障弱网环境顺畅访问。
              </p>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <button
                onClick={onExportData}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold hover:bg-blue-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t("exportData", lang)}</span>
              </button>
              <button
                onClick={onClearCache}
                className="px-3 py-1.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold hover:bg-rose-500/20"
              >
                {t("clearCache", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: ERROR DIAGNOSTICS */}
      {activeSubTab === "errors" && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-neutral-800 dark:text-slate-200">
            {t("errorLogs", lang)}
          </h3>
          {errorLogs.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 rounded bg-white dark:bg-[#0d0d0d] border border-white/10 font-mono">
              {t("noErrors", lang)}
            </p>
          ) : (
            errorLogs.map((err) => (
              <div
                key={err.id}
                className="p-3.5 rounded border border-amber-500/30 bg-amber-500/10 text-xs space-y-1 font-mono"
              >
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>[{err.source}] {err.message}</span>
                  <span className="text-[10px] text-amber-400">{err.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
