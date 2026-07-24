import React, { useState, useEffect } from "react";
import { Search, Layers, Database, GitFork, BarChart3, Plug, Wrench, Sparkles, X } from "lucide-react";
import { AppLanguage } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  lang: AppLanguage;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  lang,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled externally or passed
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: "dual-stream", label: "切换到 对话与执行双流 界面", icon: Layers },
    { id: "rag", label: "切换到 RAG 知识库与语义检索验证", icon: Database },
    { id: "workflow", label: "切换到 拖拽式 DAG Agent 工作流编排", icon: GitFork },
    { id: "analytics", label: "切换到 多维数据可视化看板", icon: BarChart3 },
    { id: "plugins", label: "切换到 模块化插件系统与工具箱", icon: Plug },
    { id: "devtools", label: "切换到 开发者与运维管理控制台", icon: Wrench },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3 border-b border-neutral-200 dark:border-white/10 flex items-center space-x-2">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            autoFocus
            placeholder="搜索指令、视图导航或 Agent 操作 (Esc 关闭)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs sm:text-sm text-neutral-800 dark:text-slate-100 focus:outline-none placeholder-slate-500 font-mono"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto space-y-1 font-mono">
          {filtered.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={() => {
                  onSelectTab(cmd.id);
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-2.5 rounded text-left hover:bg-white/5 text-xs text-neutral-800 dark:text-slate-200 transition-colors"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{cmd.label}</span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              未找到匹配指令
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
