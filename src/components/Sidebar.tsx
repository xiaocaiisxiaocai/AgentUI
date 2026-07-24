import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Pin,
  Trash2,
  Download,
  Upload,
  Search,
  Tag,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Clock,
  Sparkles,
} from "lucide-react";
import { ChatSession, AppLanguage } from "../types";
import { t } from "../i18n/translations";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onExportSession: (session: ChatSession) => void;
  lang: AppLanguage;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  onExportSession,
  lang,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract unique tags across all sessions
  const allTags = Array.from(new Set(sessions.flatMap((s) => s.tags || [])));

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.messages.some((m) =>
        m.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesTag = !selectedTag || (session.tags && session.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  return (
    <aside
      className={`relative flex flex-col border-r border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-[#0d0d0d] backdrop-blur-sm transition-all duration-300 z-20 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Toggle Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white dark:bg-[#151515] border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-slate-100 shadow-sm transition-transform z-30"
        title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Top Action: New Session Button */}
      <div className="p-4 border-b border-neutral-200 dark:border-white/10">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center space-x-2 py-2 bg-white/5 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded text-xs font-medium hover:bg-white/10 text-neutral-800 dark:text-slate-200 transition-all hover:border-white/20"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          {!isCollapsed && <span>+ New Context</span>}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search Bar & Tag Filter */}
          <div className="px-3 pt-3 pb-2 space-y-2 border-b border-neutral-200 dark:border-white/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search Contexts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#151515] text-xs text-neutral-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Tags Ribbon */}
            {allTags.length > 0 && (
              <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                    !selectedTag
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  ALL
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors ${
                      selectedTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {/* Pinned Section */}
            {pinnedSessions.length > 0 && (
              <div>
                <div className="px-2 pb-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center space-x-1">
                  <Pin className="w-3 h-3 text-amber-500" />
                  <span>已置顶会话 ({pinnedSessions.length})</span>
                </div>
                <div className="space-y-1">
                  {pinnedSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isActive={session.id === currentSessionId}
                      onSelect={() => onSelectSession(session.id)}
                      onDelete={() => onDeleteSession(session.id)}
                      onTogglePin={() => onTogglePinSession(session.id)}
                      onExport={() => onExportSession(session)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unpinned Section */}
            <div>
              {pinnedSessions.length > 0 && unpinnedSessions.length > 0 && (
                <div className="px-2 pb-1 pt-2 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>历史对话 ({unpinnedSessions.length})</span>
                </div>
              )}
              <div className="space-y-1">
                {unpinnedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onSelect={() => onSelectSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onExport={() => onExportSession(session)}
                  />
                ))}
              </div>
            </div>

            {filteredSessions.length === 0 && (
              <div className="text-center py-8 px-4 text-xs text-neutral-400">
                暂无匹配的 Agent 会话记录
              </div>
            )}
          </div>

          {/* Bottom Telemetry Footer */}
          <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a] text-[10px] font-mono text-neutral-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-blue-400" />
                <span>CACHE POLICY</span>
              </span>
              <span className="text-emerald-400">IndexedDB Synced</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>MEMORY TOKENS</span>
              </span>
              <span>
                {sessions.reduce((acc, s) => acc + (s.totalTokens || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Collapsed view icons list */}
      {isCollapsed && (
        <div className="flex-1 overflow-y-auto py-3 space-y-2 flex flex-col items-center">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                s.id === currentSessionId
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-[#151515] border border-white/10 text-neutral-600 dark:text-slate-400 hover:bg-white/10"
              }`}
              title={s.title}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};

interface SessionCardProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onExport: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
  onExport,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
        isActive
          ? "bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 text-blue-100"
          : "hover:bg-white/5 border border-transparent text-slate-400"
      }`}
    >
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-center space-x-1.5">
          <span className={`truncate text-xs font-medium ${isActive ? "text-blue-200" : "text-neutral-800 dark:text-slate-300"}`}>
            {session.title}
          </span>
        </div>

        <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-500 font-mono">
          <span>{session.updatedAt}</span>
          <span>•</span>
          <span>{session.messages.length} msgs</span>
          {session.tags && session.tags.length > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-400">#{session.tags[0]}</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions overlay */}
      <div className="hidden group-hover:flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-400"
          title={session.isPinned ? "Unpin" : "Pin"}
        >
          <Pin className={`w-3 h-3 ${session.isPinned ? "text-amber-400 fill-amber-400" : ""}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-blue-400"
          title="Export Session JSON"
        >
          <Download className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400"
          title="Delete Session"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
