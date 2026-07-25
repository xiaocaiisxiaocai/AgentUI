import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingProps> = ({
  label = "数据加载中...",
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-3 text-slate-400 ${className}`}>
      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      <span className="text-xs font-mono font-medium">{label}</span>
    </div>
  );
};
