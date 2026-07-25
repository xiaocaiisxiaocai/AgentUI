import React from "react";
import { Inbox, FolderSearch } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "暂无相关数据",
  description = "未检索到匹配的记录或当前隔离部门下无可用数据",
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 my-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-[#0c0c0e]/50 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 text-slate-400 flex items-center justify-center">
        {icon || <FolderSearch className="w-6 h-6" />}
      </div>
      <div>
        <h3 className="text-sm font-bold text-neutral-800 dark:text-slate-200">{title}</h3>
        <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
