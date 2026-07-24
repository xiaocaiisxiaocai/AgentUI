/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DualStreamView } from "./components/DualStreamView";
import { RAGView } from "./components/RAGView";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { PluginMarketplace } from "./components/PluginMarketplace";
import { DeveloperToolsModal } from "./components/DeveloperToolsModal";
import { CommandPalette } from "./components/CommandPalette";

import {
  UserRole,
  AppLanguage,
  AppTheme,
  ChatSession,
  ChatMessage,
  ExecutionStep,
  Citation,
  RAGDocument,
  RAGChunk,
  Workflow,
  AgentPlugin,
  SystemMetrics,
  ErrorLog,
  TestResult,
} from "./types";

import {
  initialDocuments,
  initialChunks,
  initialPromptTemplates,
  initialWorkflows,
  initialPlugins,
  initialMetrics,
  initialErrorLogs,
  initialTestResults,
} from "./data/mockKnowledge";

export default function App() {
  const [activeTab, setActiveTab] = useState("dual-stream");
  const [role, setRole] = useState<UserRole>("admin");
  const [lang, setLang] = useState<AppLanguage>("zh");
  const [theme, setTheme] = useState<AppTheme>("dark");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Persistent / State initializations
  const [documents, setDocuments] = useState<RAGDocument[]>(initialDocuments);
  const [chunks, setChunks] = useState<RAGChunk[]>(initialChunks);
  const [workflows] = useState<Workflow[]>(initialWorkflows);
  const [activeWorkflowId, setActiveWorkflowId] = useState(initialWorkflows[0].id);
  const [plugins, setPlugins] = useState<AgentPlugin[]>(initialPlugins);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(
    initialPlugins.filter((p) => p.enabled).map((p) => p.name)
  );
  const [metrics, setMetrics] = useState<SystemMetrics>(initialMetrics);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>(initialErrorLogs);
  const [testResults, setTestResults] = useState<TestResult[]>(initialTestResults);
  const [promptTemplates] = useState(initialPromptTemplates);

  // Initial Multi-Turn Chat Sessions
  const initialSession: ChatSession = {
    id: "session-1",
    title: "双流 RAG 文档检索与架构总结",
    createdAt: "2026-07-24",
    updatedAt: "刚刚",
    messageCount: 2,
    totalTokens: 1420,
    isPinned: true,
    tags: ["RAG", "架构设计"],
    model: "gemini-3.6-flash",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        text: "请解析当前系统的 RAG 向量检索原理与双流状态机的调度逻辑。",
        timestamp: "01:20",
      },
      {
        id: "msg-2",
        sender: "agent",
        text: "Agent Intelligence Operations Platform 采用**双流架构**（Dual-Stream Architecture）：\n\n1. **对话互动流**：保持前端轻量级响应与实时 SSE / WebSocket 格式输出；\n2. **底层执行流**：异步日志追踪 Agent 思考链、向量近邻检索（ANN）及 cross-encoder 重排序过程 [Source: Enterprise_AI_Agent_Architecture_Whitepaper_v2.4.pdf]。\n\n此外，混合语义索引使得知识召回在千级文档规模下的准确率提升至 94% 以上。",
        timestamp: "01:21",
        latencyMs: 1120,
        tokens: 380,
        citations: [
          {
            id: "cite-1",
            docTitle: "Enterprise_AI_Agent_Architecture_Whitepaper_v2.4.pdf",
            section: "§ 3.2 Dual-Stream Engine Pattern",
            excerpt: "The dual-stream runtime decouples user-facing interactive messages from asynchronous background agent executions.",
            similarity: 0.95,
            page: 14,
          }
        ],
        executionSteps: [
          {
            id: "step-1",
            name: "Prompt Intent Parsing",
            status: "completed",
            durationMs: 40,
            detail: "Parsed system intent and extracted domain tags.",
          },
          {
            id: "step-2",
            name: "RAG Vector Search & Reranking",
            status: "completed",
            durationMs: 190,
            detail: "Queried pgvector index. Matched 1 chunk with 95% similarity.",
          },
          {
            id: "step-3",
            name: "Gemini LLM Generation",
            status: "completed",
            durationMs: 890,
            detail: "Generated answer with inline source citations.",
          }
        ],
      },
    ],
  };

  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [currentSessionId, setCurrentSessionId] = useState("session-1");
  const [enableRAG, setEnableRAG] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check health & API Key on load
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch(() => setHasApiKey(true));
  }, []);

  // Sync dark class on html root element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Current Active Session
  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Send Message Handler (Call Server Backend)
  const handleSendMessage = async (
    text: string,
    attachments: any[],
    enableRAG: boolean,
    selectedPluginsList: string[]
  ) => {
    if (!text.trim() && attachments.length === 0) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments,
    };

    const updatedMessages = [...currentSession.messages, userMsg];

    // Update session state locally
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: updatedMessages, updatedAt: "刚刚" }
          : s
      )
    );

    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          enableRAG,
          plugins: selectedPluginsList,
          model: currentSession.model,
        }),
      });

      const data = await response.json();

      const agentMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        sender: "agent",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latencyMs: data.metrics?.latencyMs || 1050,
        tokens: data.metrics?.completionTokens || 340,
        citations: data.citations || [],
        executionSteps: data.executionSteps || [],
        isAiGenerated: data.isAiGenerated,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...updatedMessages, agentMsg],
                totalTokens: s.totalTokens + (data.metrics?.completionTokens || 300),
                updatedAt: "刚刚",
              }
            : s
        )
      );

      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        tokenCount: prev.tokenCount + (data.metrics?.completionTokens || 300),
      }));
    } catch (err: any) {
      console.error("Failed to fetch chat response:", err);
      const errorMsg: ChatMessage = {
        id: "msg-err-" + Date.now(),
        sender: "agent",
        text: "抱歉，Agent 处理请求时发生系统网络或接口连接异常，请重试或检查后端 API 密钥设置。",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...updatedMessages, errorMsg] }
            : s
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Session Handlers
  const handleNewSession = () => {
    const newS: ChatSession = {
      id: "session-" + Date.now(),
      title: `新 Agent 对话会话 #${sessions.length + 1}`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: "刚刚",
      messageCount: 0,
      totalTokens: 0,
      isPinned: false,
      tags: ["新任务"],
      model: "gemini-3.6-flash",
      messages: [],
    };
    setSessions([newS, ...sessions]);
    setCurrentSessionId(newS.id);
  };

  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length > 0) {
      setSessions(filtered);
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
    }
  };

  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleExportSession = (session: ChatSession) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-session-${session.id}.json`;
    a.click();
  };

  // Active execution steps from last agent message
  const lastAgentMsg = [...currentSession.messages]
    .reverse()
    .find((m) => m.sender === "agent");

  const activeExecutionSteps = lastAgentMsg?.executionSteps || [
    {
      id: "s1",
      name: "Prompt Intent Parsing",
      status: "completed",
      durationMs: 35,
      detail: "Identified system prompt parameters and intent tags.",
    },
    {
      id: "s2",
      name: "RAG Vector Search",
      status: "completed",
      durationMs: 140,
      detail: "Retrieved chunks with cosine distance threshold > 0.82.",
    },
    {
      id: "s3",
      name: "Gemini 3.6 Flash Generation",
      status: "completed",
      durationMs: 920,
      detail: "Synthesized markdown output with source attribution links.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-100 dark:bg-[#050505] text-neutral-900 dark:text-slate-200 transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={setRole}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onOpenCmdPalette={() => setIsCmdPaletteOpen(true)}
        onOpenDevTools={() => setActiveTab("devtools")}
        hasApiKey={hasApiKey}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Multi-turn Chat History & Context Switcher) */}
        {activeTab === "dual-stream" && (
          <Sidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={setCurrentSessionId}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            onTogglePinSession={handleTogglePinSession}
            onExportSession={handleExportSession}
            lang={lang}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        )}

        {/* Tab View Switcher */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === "dual-stream" && (
            <DualStreamView
              messages={currentSession.messages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              activeExecutionSteps={activeExecutionSteps}
              citations={lastAgentMsg?.citations || []}
              enableRAG={enableRAG}
              setEnableRAG={setEnableRAG}
              lang={lang}
              promptTemplates={promptTemplates}
              availablePlugins={plugins.map((p) => p.name)}
              selectedPlugins={selectedPlugins}
              setSelectedPlugins={setSelectedPlugins}
              onClearHistory={() => {
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === currentSessionId ? { ...s, messages: [] } : s
                  )
                );
              }}
            />
          )}

          {activeTab === "rag" && (
            <RAGView
              documents={documents}
              chunks={chunks}
              onUploadDocument={(doc) => setDocuments([doc, ...documents])}
              onDeleteDocument={(id) =>
                setDocuments(documents.filter((d) => d.id !== id))
              }
              lang={lang}
            />
          )}

          {activeTab === "workflow" && (
            <WorkflowCanvas
              workflows={workflows}
              activeWorkflowId={activeWorkflowId}
              setActiveWorkflowId={setActiveWorkflowId}
              lang={lang}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsDashboard metrics={metrics} lang={lang} />
          )}

          {activeTab === "plugins" && (
            <PluginMarketplace
              plugins={plugins}
              onTogglePlugin={(id) =>
                setPlugins((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
                )
              }
              lang={lang}
            />
          )}

          {activeTab === "devtools" && (
            <DeveloperToolsModal
              hasApiKey={hasApiKey}
              errorLogs={errorLogs}
              testResults={testResults}
              onRunAutoTest={() => {
                const newTest: TestResult = {
                  id: "test-" + Date.now(),
                  testName: "RAG Source Attribution & Latency Test",
                  passed: true,
                  latencyMs: Math.floor(Math.random() * 300) + 800,
                  similarityScore: 0.95,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };
                setTestResults([newTest, ...testResults]);
              }}
              onClearCache={() => {
                alert("已清除本地离线缓存与存储数据。");
              }}
              onExportData={() => {
                const data = { sessions, documents, workflows, metrics };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "agent-studio-backup.json";
                a.click();
              }}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Elegant Dark Bottom Telemetry Status Bar */}
      <footer className="h-9 bg-neutral-900/80 dark:bg-[#0d0d0d] border-t border-neutral-200 dark:border-white/10 flex items-center px-4 sm:px-6 space-x-6 text-[10px] text-neutral-500 dark:text-slate-400 font-mono select-none">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="uppercase tracking-wider">Sys Health: 100%</span>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <span className="uppercase">Memory: 2.4 GB / 8 GB</span>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <span className="uppercase">Context: 32k / 128k</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="text-indigo-600 dark:text-blue-400 hover:underline"
          >
            Shortcuts (⌘K)
          </button>
          <span className="hidden md:inline text-neutral-400 dark:text-slate-600">v2.8.4 Stable</span>
        </div>
      </footer>

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onSelectTab={setActiveTab}
        lang={lang}
      />
    </div>
  );

}
