import React from "react";
import {
  Bot,
  Layers,
  Database,
  GitFork,
  BarChart3,
  Plug,
  Wrench,
  Search,
  Globe,
  Sun,
  Moon,
  Key,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { UserRole, AppLanguage, AppTheme } from "../types";
import { t } from "../i18n/translations";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  onOpenCmdPalette: () => void;
  onOpenDevTools: () => void;
  hasApiKey: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  role,
  setRole,
  lang,
  setLang,
  theme,
  setTheme,
  onOpenCmdPalette,
  onOpenDevTools,
  hasApiKey,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const tabs = [
    { id: "dual-stream", label: t("tabDualStream", lang), icon: Layers },
    { id: "rag", label: t("tabRagKnowledge", lang), icon: Database },
    { id: "workflow", label: t("tabWorkflow", lang), icon: GitFork },
    { id: "analytics", label: t("tabAnalytics", lang), icon: BarChart3 },
    { id: "plugins", label: t("tabPlugins", lang), icon: Plug },
    { id: "devtools", label: t("tabDevTools", lang), icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5">
        <div className="flex items-center justify-between h-13 py-1.5">
          {/* BRAND / LOGO AREA */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm tracking-wider font-mono uppercase text-slate-900 dark:text-slate-100">
                AGENT NEXUS
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> 企业内部Agent助手
              </span>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                试点部门: 售后技术部 / 运营助理部
              </span>
            </div>
          </div>

          {/* SEGMENTED CONTROL TAB NAVIGATION */}
          <nav className="hidden md:flex items-center bg-neutral-100 dark:bg-[#141417] border border-neutral-200 dark:border-white/10 p-1 rounded-lg space-x-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white dark:bg-[#222227] text-neutral-900 dark:text-slate-100 shadow-xs border border-neutral-200/80 dark:border-white/10 font-semibold"
                      : "text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200 hover:bg-neutral-200/50 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-400"}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION CONTROL BAR */}
          <div className="flex items-center space-x-2">
            {/* Quick Command Search Button */}
            <button
              onClick={onOpenCmdPalette}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-mono transition-colors"
              title="Command Palette (Ctrl+K / Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">⌘K</span>
            </button>

            {/* API Key / DevTools Pill */}
            <button
              onClick={onOpenDevTools}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                hasApiKey
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40"
              }`}
              title={hasApiKey ? t("keyActive", lang) : t("keyMissing", lang)}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <Key className="w-3 h-3" />
              <span className="hidden sm:inline">
                {hasApiKey ? "ACTIVE" : "SIM"}
              </span>
            </button>

            {/* Role Switcher */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="hidden xl:block text-[11px] font-mono rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#141417] text-neutral-700 dark:text-slate-300 px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="admin">ADMIN</option>
              <option value="developer">DEV</option>
              <option value="viewer">VIEWER</option>
            </select>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="px-2 py-1 rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/10 text-[11px] font-mono flex items-center space-x-1 transition-colors"
              title={t("langSelect", lang)}
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>{lang === "zh" ? "中文" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
              title={t("themeSelect", lang)}
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-neutral-700" />
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md md:hidden text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DROPDOWN */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-200 dark:border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-neutral-700 dark:text-slate-300 bg-neutral-100 dark:bg-[#141417] hover:bg-neutral-200 dark:hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2 flex items-center justify-between px-1 text-xs text-slate-400 font-mono">
              <span>{t("roleSelect", lang)}:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="text-xs border rounded-md px-2 py-1 bg-neutral-100 dark:bg-[#141417] dark:border-white/10 text-neutral-800 dark:text-slate-200"
              >
                <option value="admin">ADMIN</option>
                <option value="developer">DEVELOPER</option>
                <option value="viewer">VIEWER</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

