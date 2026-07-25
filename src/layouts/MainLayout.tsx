import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  Sun,
  Moon,
  ChevronDown,
  Building2,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  UserCheck,
  Globe,
  Lock,
  Layers,
  Type,
  Maximize2,
  Menu,
  X
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { AppEnvironment, UserRole, FontSize, SpacingMode } from "../types";
import { t } from "../i18n/translations";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    lang,
    setLang,
    theme,
    setTheme,
    viewMode,
    setViewMode,
    userRole,
    setUserRole,
    environment,
    setEnvironment,
    selectedDept,
    setSelectedDept,
    fontSize,
    setFontSize,
    spacingMode,
    setSpacingMode,
    approvals,
    isInspectorOpen,
    toggleInspector
  } = useAppStore();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const pendingApprovalCount = approvals.filter((a) => a.status === "pending").length;

  const navItems = [
    { path: "/workspace", label: t("navWorkspace", lang), icon: MessageSquare, badge: "Chat" },
    { path: "/agents", label: t("navAgents", lang), icon: Bot, badge: "6" },
    { path: "/knowledge", label: t("navKnowledge", lang), icon: Database, badge: "RAG" },
    { path: "/tools", label: t("navTools", lang), icon: Wrench, badge: "6" },
    { path: "/connectors", label: t("navConnectors", lang), icon: Link2, badge: "4" },
    { path: "/modules", label: t("navModules", lang), icon: Layers, badge: "6" },
    { path: "/workflows", label: t("navWorkflows", lang), icon: Workflow, badge: "Flow" },
    { path: "/approvals", label: t("navApprovals", lang), icon: UserCheck, badge: pendingApprovalCount > 0 ? `${pendingApprovalCount}` : "0", isAlert: pendingApprovalCount > 0 },
    { path: "/runs", label: t("navRuns", lang), icon: Activity, badge: "Trace" },
    { path: "/evaluations", label: t("navEvaluations", lang), icon: BarChart3, badge: "Eval" },
    { path: "/rbac", label: t("navRbac", lang), icon: ShieldCheck, badge: "RBAC" },
    { path: "/settings", label: t("navSettings", lang), icon: Settings, badge: "Admin" },
  ];

  const departments = lang === "zh" ? [
    "全部试点部门",
    "售后技术部",
    "运营助理部",
    "通用行政部",
    "财务部 (预留)",
    "人力资源部 (预留)"
  ] : [
    "All Pilot Departments",
    "After-Sales Tech Dept",
    "Operations Assistant Dept",
    "General Admin Dept",
    "Finance Dept (Reserved)",
    "HR Dept (Reserved)"
  ];

  const environments: { id: AppEnvironment; name: string; color: string }[] = [
    { id: "dev", name: lang === "zh" ? "开发环境 (Dev)" : "Dev Environment", color: "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30" },
    { id: "staging", name: lang === "zh" ? "测试环境 (Staging)" : "Staging Environment", color: "text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/30" },
    { id: "prod", name: lang === "zh" ? "生产环境 (Prod)" : "Prod Environment", color: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
  ];

  const roles: { id: UserRole; name: string }[] = [
    { id: "admin", name: t("roleAdmin", lang) },
    { id: "developer", name: t("roleDeveloper", lang) },
    { id: "operator", name: t("roleOperator", lang) },
    { id: "viewer", name: t("roleViewer", lang) },
  ];

  const activeEnv = environments.find((e) => e.id === environment) || environments[1];

  const renderSidebarBody = () => (
    <div className="flex flex-col justify-between h-full overflow-y-auto">
      <div>
        {/* LOGO AREA */}
        <div className="p-4 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide text-neutral-900 dark:text-slate-100 block">
                AGENT NEXUS
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold block">
                Enterprise AI Platform
              </span>
            </div>
          </div>
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* WORKSPACE & DEPARTMENT SELECTOR */}
        <div className="p-3 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#111115]">
          <div className="relative">
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#08080a] hover:border-blue-500/50 flex items-center justify-between text-xs sm:text-sm transition-colors"
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                <div className="text-left truncate">
                  <span className="text-xs text-neutral-500 dark:text-slate-400 block font-mono">
                    {lang === "zh" ? "工作空间 / 部门" : "Workspace / Dept"}
                  </span>
                  <span className="font-bold text-neutral-800 dark:text-slate-200 truncate block text-xs sm:text-sm">{selectedDept}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-slate-400 shrink-0" />
            </button>

            {showDeptDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] shadow-2xl py-1 text-xs sm:text-sm space-y-0.5">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDept(dept);
                      setShowDeptDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 ${
                      selectedDept === dept ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10" : "text-neutral-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="truncate">{dept}</span>
                    {selectedDept === dept && <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
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
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-neutral-700 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-slate-100 hover:bg-neutral-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-500 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    item.isAlert
                      ? "bg-red-500 text-white font-extrabold animate-pulse"
                      : isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* SIDEBAR FOOTER: DEMO BADGE & SYSTEM STATUS */}
      <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#08080a] space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 font-mono text-xs font-bold">
          <span className="flex items-center space-x-1">
            <Info className="w-3.5 h-3.5" />
            <span>{lang === "zh" ? "数据标识:" : "Data Mode:"}</span>
          </span>
          <span>Mock Active</span>
        </div>

        <div className="flex items-center justify-between text-neutral-500 dark:text-slate-400 text-xs font-mono px-1">
          <span>LLM: Gemini 3.6 Flash</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Healthy</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-[#050505] text-neutral-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-60 xl:w-64 border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b] flex-col justify-between shrink-0 select-none z-20">
        {renderSidebarBody()}
      </aside>

      {/* MOBILE / TABLET OVERLAY DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[82vw] h-full border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b] flex flex-col justify-between z-10 shadow-2xl select-none">
            {renderSidebarBody()}
          </aside>
        </div>
      )}

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-neutral-50 dark:bg-[#050505]">
        {/* TOP HEADER BAR */}
        <header className="h-14 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#09090b] px-3 sm:px-6 flex items-center justify-between shrink-0 z-10 gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 flex-1">
            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/5 lg:hidden shrink-0"
              title="打开导航菜单"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* ENVIRONMENT SWITCHER */}
            <div className="relative min-w-0 shrink sm:shrink-0">
              <button
                onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                className={`px-2 sm:px-3 py-1.5 rounded-lg border font-mono text-xs sm:text-sm font-bold flex items-center space-x-1 sm:space-x-1.5 transition-all max-w-full min-w-0 ${activeEnv.color}`}
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 hidden sm:block" />
                <span className="truncate min-w-0 flex-1">{activeEnv.name}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0 hidden sm:block" />
              </button>

              {showEnvDropdown && (
                <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] shadow-2xl p-1 z-50 text-xs sm:text-sm space-y-1">
                  {environments.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        setEnvironment(e.id);
                        setShowEnvDropdown(false);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between font-mono ${
                        environment === e.id
                          ? "bg-blue-600/20 text-blue-600 dark:text-blue-300 font-bold"
                          : "text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{e.name}</span>
                      {environment === e.id && <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 hidden xl:inline truncate">
              | {lang === "zh" ? "企业级 Pilot Agent Nexus v3.2" : "Enterprise Pilot Agent Nexus v3.2"}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
            {/* VIEW MODE TOGGLE */}
            <button
              onClick={() => setViewMode(viewMode === "expert" ? "business" : "expert")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold border transition-all flex items-center space-x-1 sm:space-x-1.5 ${
                viewMode === "expert"
                  ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40"
                  : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" />
              <span className="hidden sm:inline">{viewMode === "expert" ? t("expertMode", lang) : t("businessMode", lang)}</span>
              <span className="sm:hidden">{viewMode === "expert" ? "专家" : "业务"}</span>
            </button>

            {/* LANG SWITCH */}
            <button
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded border border-neutral-200 dark:border-white/10 text-xs sm:text-sm font-mono text-neutral-800 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-white/5 font-bold flex items-center space-x-1"
              title={t("langSelect", lang)}
            >
              <Globe className="w-3.5 h-3.5 text-blue-500 hidden sm:block" />
              <span className="text-xs sm:text-sm">{lang === "zh" ? "中" : "EN"}</span>
            </button>

            {/* DISPLAY / FONT & SPACING SETTINGS TOGGLE */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowDisplaySettings(!showDisplaySettings)}
                className={`p-2 rounded border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center space-x-1 font-mono text-xs ${
                  showDisplaySettings ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500" : ""
                }`}
                title={lang === "zh" ? "字号与间距调节" : "Font & Spacing Controls"}
              >
                <Type className="w-4 h-4 text-blue-500" />
                <span className="font-bold hidden xl:inline">{fontSize === "xlarge" ? "大号字" : fontSize === "large" ? "中号字" : "标准字"}</span>
              </button>

              {showDisplaySettings && (
                <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] shadow-2xl p-4 z-50 space-y-4 text-xs sm:text-sm text-neutral-900 dark:text-slate-100">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-2">
                    <span className="font-bold flex items-center space-x-1.5">
                      <Type className="w-4 h-4 text-blue-500" />
                      <span>{lang === "zh" ? "外观字号与视图间距" : "Display & Typography"}</span>
                    </span>
                    <button
                      onClick={() => setShowDisplaySettings(false)}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* FONT SIZE CONTROLS */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 dark:text-slate-400 font-mono">
                      {lang === "zh" ? "全平台字体大小 (Font Size)" : "Font Size"}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5">
                      {[
                        { id: "normal", label: "标准 (14px)", short: "A" },
                        { id: "large", label: "中号 (16px)", short: "A+" },
                        { id: "xlarge", label: "特大 (18px)", short: "A++" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFontSize(item.id as FontSize)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all ${
                            fontSize === item.id
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-white/5"
                          }`}
                        >
                          {item.short}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SPACING MODE CONTROLS */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 dark:text-slate-400 font-mono">
                      {lang === "zh" ? "卡片间距密度 (Layout Density)" : "Layout Density"}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5">
                      {[
                        { id: "compact", label: "紧凑" },
                        { id: "comfortable", label: "舒适" },
                        { id: "spacious", label: "宽松" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSpacingMode(item.id as SpacingMode)}
                          className={`py-1.5 px-1 rounded-lg text-xs font-bold font-mono transition-all ${
                            spacingMode === item.id
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-white/5"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* THEME TOGGLE */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
              title={t("themeSelect", lang)}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* INSPECTOR TOGGLE */}
            <button
              onClick={toggleInspector}
              className={`p-2 rounded border text-xs sm:text-sm flex items-center space-x-1 ${
                isInspectorOpen
                  ? "bg-blue-600 text-white border-blue-500"
                  : "border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
              title="Inspector"
            >
              {isInspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>

            {/* ROLE SWITCHER DROPDOWN */}
            <div className="relative pl-1.5 sm:pl-2 border-l border-neutral-200 dark:border-white/10">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2 text-xs sm:text-sm hover:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {userRole.substring(0, 1).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="font-bold text-neutral-800 dark:text-slate-200 block truncate max-w-[120px]">
                    {roles.find((r) => r.id === userRole)?.name.split(" ")[0]}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">RBAC</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-slate-400 hidden lg:block" />
              </button>

              {showRoleDropdown && (
                <div className="absolute top-full right-0 mt-1 w-56 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] shadow-2xl p-1 z-50 text-xs sm:text-sm space-y-1">
                  <div className="px-2 py-1 text-xs text-neutral-500 dark:text-slate-400 font-mono font-bold border-b border-neutral-200 dark:border-white/5">
                    {t("roleSelect", lang)}
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setUserRole(r.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between ${
                        userRole === r.id
                          ? "bg-blue-600/20 text-blue-600 dark:text-blue-300 font-bold"
                          : "text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{r.name}</span>
                      {userRole === r.id && <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main
          className={`flex-1 overflow-hidden relative flex bg-neutral-50 dark:bg-[#050505] transition-all ${
            fontSize === "xlarge"
              ? "text-base lg:text-lg"
              : fontSize === "large"
              ? "text-sm lg:text-base"
              : "text-xs lg:text-sm"
          } ${
            spacingMode === "spacious"
              ? "[&_.p-6]:p-8 [&_.p-4]:p-6 [&_.space-y-6]:space-y-8"
              : spacingMode === "compact"
              ? "[&_.p-6]:p-4 [&_.p-4]:p-3 [&_.space-y-6]:space-y-4"
              : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};


