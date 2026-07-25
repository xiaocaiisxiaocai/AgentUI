import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-[#050505] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-100 font-mono">404 - 页面或资源不存在</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          您访问的路由或详情 ID 未找到，可能已被删除或权限受限。
        </p>
      </div>
      <Link
        to="/workspace"
        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回 Agent 工作台</span>
      </Link>
    </div>
  );
};
