import React, { useState } from "react";
import {
  MessageSquare,
  Bot,
  Database,
  Wrench,
  Link2,
  Workflow,
  Activity,
  BarChart3,
  Settings,
  Sparkles,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  SlidersHorizontal,
  Info,
  User,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  Layers
} from "lucide-react";
import { NavPageId, AppLanguage, AppTheme, ViewMode, UserRole } from "../types";

interface MainLayoutProps {
  activePage: NavPageId;
  onSelectPage: (page: NavPageId) => void;
  lang: AppLanguage;
  onToggleLang: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  userRole: UserRole;
  selectedDept: string;
  onSelectDept: (dept: string) => void;
  children: React.ReactNode;
  toggleInspector?: () => void;
  isInspectorOpen?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activePage,
  onSelectPage,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  userRole,
  selectedDept,
  onSelectDept,
  children,
  toggleInspector,
  isInspectorOpen
}) => {
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const navItems = [
    { id: "workspace" as NavPageId, label: "工作台", icon: MessageSquare, badge: "Chat" },
    { id: "agents" as NavPageId, label: "Agent 中心", icon: Bot, badge: "6" },
    { id: "knowledge" as NavPageId, label: "知识库", icon: Database, badge: "RAG" },
    { id: "tools" as NavPageId, label: "工具中心", icon: Wrench, badge: "6" },
    { id: "connectors" as NavPageId, label: "连接器", icon: Link2, badge: "4" },
    { id: "workflows" as NavPageId, label: "工作流", icon: Workflow, badge: "Flow" },
    { id: "runs" as NavPageId, label: "运行中心", icon: Activity, badge: "Trace" },
    { id: "evaluations" as NavPageId, label: "评测中心", icon: BarChart3, badge: "Eval" },
    { id: "settings" as NavPageId, label: "平台管理", icon: Settings, badge: "Admin" },
  ];

  const departments = [
    "全部试点部门",
    "售后技术部",
    "运营助理部",
    "通用行政部",
    "财务部 (预留)",
    "人力资源部 (预留)"
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* LEFT VERTICAL SIDEBAR NAVIGATION */}
      <aside className="w-56 sm:w-64 border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b] flex flex-col justify-between shrink-0 select-none z-20">
        <div>
          {/* LOGO AREA */}
          <div className="p-4 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wide text-neutral-900 dark:text-slate-100 block">
                  AGENT NEXUS
                </span>
                <span className="text-[10px] text-blue-400 font-mono font-semibold block">
                  Enterprise AI Platform
                </span>
              </div>
            </div>
          </div>

          {/* WORKSPACE & DEPARTMENT SELECTOR */}
          <div className="p-3 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#111115]">
            <div className="relative">
              <button
                onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                className="w-full p-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#08080a] hover:border-blue-500/50 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <div className="text-left truncate">
                    <span className="text-[10px] text-slate-400 block font-mono">工作空间 / 部门</span>
                    <span className="font-bold text-slate-200 truncate block">{selectedDept}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {showDeptDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] shadow-2xl py-1 text-xs space-y-0.5">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        onSelectDept(dept);
                        setShowDeptDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 ${
                        selectedDept === dept ? "text-blue-400 font-bold bg-blue-500/10" : "text-slate-300"
                      }`}
                    >
                      <span className="truncate">{dept}</span>
                      {selectedDept === dept && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id)}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? "bg-white/20 text-white font-bold" : "bg-neutral-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER: DEMO BADGE & SYSTEM STATUS */}
        <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] space-y-2 text-[11px]">
          <div className="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
            <span className="flex items-center space-x-1">
              <Info className="w-3 h-3" />
              <span>数据状态:</span>
            </span>
            <span>DEMO / MOCK DATA</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono px-1">
            <span>引擎: Gemini 3.6 Flash</span>
            <span className="text-emerald-400 font-bold">● Live</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50 dark:bg-[#050505]">
        {/* TOP HEADER BAR */}
        <header className="h-14 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b] px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-slate-100 capitalize">
              {navItems.find((n) => n.id === activePage)?.label || "AGENT NEXUS"}
            </h2>
            <span className="text-xs text-slate-500 hidden md:inline">| Pilot Version v3.1</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* VIEW MODE TOGGLE (Business vs Expert) */}
            <button
              onClick={onToggleViewMode}
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 ${
                viewMode === "expert"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
              }`}
              title="切换业务模式 (隐藏底层指标) 与 专家模式 (显示 Token/Latency/Trace)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{viewMode === "expert" ? "专家模式 (Expert)" : "业务模式 (Business)"}</span>
            </button>

            {/* LANG SWITCH */}
            <button
              onClick={onToggleLang}
              className="px-2 py-1 rounded border border-neutral-200 dark:border-white/10 text-xs font-mono text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/5"
            >
              {lang === "zh" ? "中" : "EN"}
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded border border-neutral-200 dark:border-white/10 text-slate-400 hover:text-white"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* INSPECTOR TOGGLE BUTTON */}
            {toggleInspector && (
              <button
                onClick={toggleInspector}
                className={`p-1.5 rounded border text-xs flex items-center space-x-1 ${
                  isInspectorOpen
                    ? "bg-blue-600 text-white border-blue-500"
                    : "border-neutral-200 dark:border-white/10 text-slate-400 hover:text-white"
                }`}
                title="开启/关闭右侧 Inspector 追踪面板"
              >
                {isInspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            )}

            {/* USER PROFILE */}
            <div className="flex items-center space-x-2 pl-2 border-l border-neutral-200 dark:border-white/10">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                管
              </div>
              <div className="hidden lg:block text-left text-xs">
                <span className="font-bold text-slate-200 block">管理员 (Admin)</span>
                <span className="text-[10px] text-slate-400 font-mono">售后/运营双域</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 overflow-hidden relative flex">
          {children}
        </main>
      </div>
    </div>
  );
};
