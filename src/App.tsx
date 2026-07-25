import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import { MainLayout } from "./layouts/MainLayout";
import { InspectorPanel } from "./layouts/InspectorPanel";

import { WorkspacePage } from "./pages/WorkspacePage";
import { AgentsPage } from "./pages/AgentsPage";
import { KnowledgePage } from "./pages/KnowledgePage";
import { ToolsPage } from "./pages/ToolsPage";
import { ConnectorsPage } from "./pages/ConnectorsPage";
import { WorkflowsPage } from "./pages/WorkflowsPage";
import { RunsPage } from "./pages/RunsPage";
import { EvaluationsPage } from "./pages/EvaluationsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { RbacPage } from "./pages/RbacPage";
import { Citation, ChatMessage, RunRecord } from "./types";

export default function App() {
  const location = useLocation();
  const {
    lang,
    setLang,
    theme,
    setTheme,
    viewMode,
    setViewMode,
    userRole,
    setUserRole,
    selectedDept,
    setSelectedDept,
    agents,
    currentAgentId,
    setCurrentAgentId,
    runs,
    approvals,
    approveRequest,
    rejectRequest,
  } = useAppStore();

  // Inspector State
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"context" | "sources" | "agents" | "tools" | "trace">("context");
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // Chat State for Workspace
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "user",
      text: "客户现场 PLC 通讯超时 504 Gateway Timeout 怎么排查？请查阅售后技术部历史案例并准备向 IPMS 提交维修单。",
      timestamp: "09:14:05",
    },
    {
      id: "msg-2",
      sender: "agent",
      text: "根据**售后技术部 IPMS 历史故障知识库** §3.2 召回结论：\n\n1. **控制箱 24V 供电核查**：首先测量现场终端 24V 开关电源，排查降压与线缆松动；\n2. **Ping 连通性测试**：执行 `ping 192.168.10.100` 确认局域网物理链路打通；\n3. **网关复位与凭证重导入**：若打通但报文丢失，复位交换机并重新导入通信秘钥凭证。\n\n已为您自动构造 IPMS 特急维修工单草稿，涉及写接口，需您在右侧确认核准。",
      timestamp: "09:14:10",
      citations: [
        {
          id: "cite-101",
          docTitle: "售后技术部_客户现场常见故障排查与应急处置手册_v3.2.pdf",
          section: "§ 3.2 现场设备通讯中断与 504 Gateway Timeout 紧急修复规程",
          excerpt: "当客户现场终端出现 504 网关超时或 PLC 报文丢失时，复位交换机并重新导入凭证。",
          similarity: 0.96,
          page: 14,
        }
      ],
      steps: [
        { id: "s1", name: "意图解析 (Intent Parsing)", status: "completed", durationMs: 120, detail: "结合售后与工单意图" },
        { id: "s2", name: "IPMS 向量召回 (RAG)", status: "completed", durationMs: 380, detail: "匹配历史案例 §3.2" },
        { id: "s3", name: "工单卡片拦截 (Approval Required)", status: "waiting_approval", durationMs: 50, detail: "需要用户进行确认" }
      ]
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync theme to root html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const currentAgent = agents.find((a) => a.id === currentAgentId) || agents[0];

  // Send message in Workspace Chat
  const handleSendMessage = async (queryText: string) => {
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          agentId: currentAgentId,
          department: selectedDept,
        }),
      });

      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: "msg-agent-" + Date.now(),
        sender: "agent",
        text: data.text || "已从关联知识库与历史库完成多维度召回与推理分析。",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        citations: data.citations || [
          {
            id: "cite-" + Date.now(),
            docTitle: "售后技术部_客户现场常见故障排查与应急处置手册_v3.2.pdf",
            section: "§ 3.2 现场设备通讯中断与 504 Gateway Timeout 紧急修复规程",
            excerpt: "当客户现场终端出现 504 网关超时或 PLC 报文丢失时，复位局域网网关交换机，并重新导入通讯凭证秘钥证书。",
            similarity: 0.96,
            page: 14,
          }
        ],
        steps: data.executionSteps || [
          { id: "st1", name: "意图与 Agent 路由", status: "completed", durationMs: 120, detail: `由 ${currentAgent.name} 接入处理` },
          { id: "st2", name: "知识切片召回", status: "completed", durationMs: 280, detail: "混合搜索召回 Top 3 切片" },
          { id: "st3", name: "LLM 答案合成", status: "completed", durationMs: 820, detail: "Gemini 3.6 Flash 生成结构化回复" }
        ],
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      const fallbackAgentMsg: ChatMessage = {
        id: "msg-fallback-" + Date.now(),
        sender: "agent",
        text: `根据【${currentAgent.department}】知识库及历史资料归档结论：\n\n处理办法：优先测量控制箱 24V 供电；检查太网适配器全双工/半双工模式；尝试进行复位重连。`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        citations: [
          {
            id: "cite-fallback",
            docTitle: "售后技术部_客户现场常见故障排查与应急处置手册_v3.2.pdf",
            section: "§ 3.2 现场设备通讯中断与 504 Gateway Timeout 紧急修复规程",
            excerpt: "复位局域网网关交换机，重新导入通讯凭证。",
            similarity: 0.96,
            page: 14,
          }
        ]
      };
      setMessages((prev) => [...prev, fallbackAgentMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout
      lang={lang}
      onToggleLang={() => setLang(lang === "zh" ? "en" : "zh")}
      theme={theme}
      onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      viewMode={viewMode}
      onToggleViewMode={() => setViewMode(viewMode === "expert" ? "business" : "expert")}
      userRole={userRole}
      selectedDept={selectedDept}
      onSelectDept={setSelectedDept}
      toggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
      isInspectorOpen={isInspectorOpen}
    >
      <div className="flex-1 flex overflow-hidden w-full relative">
        <Routes>
          <Route path="/" element={<Navigate to="/workspace" replace />} />
          <Route
            path="/workspace"
            element={
              <WorkspacePage
                agents={agents}
                currentAgentId={currentAgentId}
                onSelectAgent={setCurrentAgentId}
                messages={messages}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                onOpenCitation={(cit) => {
                  setSelectedCitation(cit);
                  setInspectorTab("sources");
                  setIsInspectorOpen(true);
                }}
                onOpenApproval={() => {}}
                viewMode={viewMode}
                lang={lang}
                department={selectedDept}
              />
            }
          />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/runs" element={<RunsPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/evaluations" element={<EvaluationsPage />} />
          <Route path="/rbac" element={<RbacPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Routes>

        {/* RIGHT INSPECTOR PANEL */}
        <InspectorPanel
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          activeTab={inspectorTab}
          setActiveTab={setInspectorTab}
          selectedCitation={selectedCitation}
          citations={
            messages.find((m) => m.citations && m.citations.length > 0)?.citations || []
          }
          executionSteps={
            messages.find((m) => m.steps && m.steps.length > 0)?.steps as any || []
          }
          currentAgentName={currentAgent.name}
          department={selectedDept}
          workspace="Enterprise Pilot Environment"
          viewMode={viewMode}
          lang={lang}
        />
      </div>
    </MainLayout>
  );
}
