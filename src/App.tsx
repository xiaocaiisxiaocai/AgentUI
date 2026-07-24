import React, { useState, useEffect } from "react";
import {
  NavPageId,
  AppLanguage,
  AppTheme,
  ViewMode,
  UserRole,
  AgentDefinition,
  ToolDefinition,
  ConnectorDefinition,
  KnowledgeBase,
  KnowledgeSource,
  RAGDocument,
  RAGChunk,
  Workflow,
  RunRecord,
  ApprovalRequest,
  EvaluationMetric,
  OpenApiEndpoint,
  ChatMessage,
  Citation
} from "./types";

import {
  initialAgents,
  initialTools,
  initialConnectors,
  initialKnowledgeBases,
  initialKnowledgeSources,
  initialRuns,
  initialApprovals,
  initialEvaluations
} from "./data/mockEnterpriseData";

import {
  initialDocuments,
  initialChunks,
  initialWorkflows,
  initialOpenApiEndpoints
} from "./data/mockKnowledge";

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

export default function App() {
  const [activePage, setActivePage] = useState<NavPageId>("workspace");
  const [lang, setLang] = useState<AppLanguage>("zh");
  const [theme, setTheme] = useState<AppTheme>("dark");
  const [viewMode, setViewMode] = useState<ViewMode>("business");
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [selectedDept, setSelectedDept] = useState<string>("全部试点部门");

  // Enterprise Entities State
  const [agents, setAgents] = useState<AgentDefinition[]>(initialAgents);
  const [currentAgentId, setCurrentAgentId] = useState<string>("agent-supervisor");
  const [tools, setTools] = useState<ToolDefinition[]>(initialTools);
  const [connectors, setConnectors] = useState<ConnectorDefinition[]>(initialConnectors);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(initialKnowledgeBases);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(initialKnowledgeSources);
  const [documents, setDocuments] = useState<RAGDocument[]>(initialDocuments);
  const [chunks, setChunks] = useState<RAGChunk[]>(initialChunks);
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [runs, setRuns] = useState<RunRecord[]>(initialRuns);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(initialApprovals);
  const [evaluations, setEvaluations] = useState<EvaluationMetric[]>(initialEvaluations);
  const [endpoints, setEndpoints] = useState<OpenApiEndpoint[]>(initialOpenApiEndpoints);

  // Inspector Panel State
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

  // Active Agent object
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

  // Approval Handlers
  const handleApproveRequest = (id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
    );
    const newRun: RunRecord = {
      id: "run-appr-" + Date.now(),
      user: "管理员 (Admin)",
      agentName: "工单生成与审批 Agent",
      agentId: "agent-ticket",
      taskSummary: "IPMS 现场维修工单提交 [人工审核通过]",
      startTime: new Date().toLocaleTimeString(),
      durationMs: 450,
      status: "completed",
      tokensUsed: 620,
      costUsd: 0.0001,
      kbsUsed: [],
      toolsCalled: ["IPMS 现场维修工单创建接口"],
      childAgentsCalled: [],
      traceSteps: [
        { id: "s1", stepName: "用户手动点击批准 (Approved)", type: "approval", durationMs: 20, status: "success", detail: "签名与写权限核验对齐" },
        { id: "s2", stepName: "执行 tool-ticket-create 写入", type: "tool", durationMs: 430, status: "success", detail: "工单创建成功: #IPMS-TICK-90812" }
      ]
    };
    setRuns([newRun, ...runs]);
  };

  const handleRejectRequest = (id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
    );
  };

  return (
    <MainLayout
      activePage={activePage}
      onSelectPage={setActivePage}
      lang={lang}
      onToggleLang={() => setLang((l) => (l === "zh" ? "en" : "zh"))}
      theme={theme}
      onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      viewMode={viewMode}
      onToggleViewMode={() => setViewMode((v) => (v === "expert" ? "business" : "expert"))}
      userRole={userRole}
      selectedDept={selectedDept}
      onSelectDept={setSelectedDept}
      toggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
      isInspectorOpen={isInspectorOpen}
    >
      {/* PAGE ROUTER */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {activePage === "workspace" && (
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
            onOpenApproval={() => {
              setActivePage("runs");
            }}
            viewMode={viewMode}
            lang={lang}
            department={selectedDept}
          />
        )}

        {activePage === "agents" && (
          <AgentsPage
            agents={agents}
            onAddAgent={(ag) => setAgents([ag, ...agents])}
            onUpdateAgent={(ag) => setAgents(agents.map((a) => (a.id === ag.id ? ag : a)))}
            onSelectAgentForChat={(id) => {
              setCurrentAgentId(id);
              setActivePage("workspace");
            }}
            knowledgeBases={knowledgeBases}
            tools={tools}
            lang={lang}
          />
        )}

        {activePage === "knowledge" && (
          <KnowledgePage
            documents={documents}
            chunks={chunks}
            knowledgeBases={knowledgeBases}
            knowledgeSources={knowledgeSources}
            onUploadDocument={(doc) => setDocuments([doc, ...documents])}
            lang={lang}
            viewMode={viewMode}
          />
        )}

        {activePage === "tools" && (
          <ToolsPage
            tools={tools}
            onAddTool={(tl) => setTools([tl, ...tools])}
            lang={lang}
          />
        )}

        {activePage === "connectors" && (
          <ConnectorsPage
            connectors={connectors}
            onAddConnector={(cn) => setConnectors([cn, ...connectors])}
            lang={lang}
          />
        )}

        {activePage === "workflows" && (
          <WorkflowsPage
            workflows={workflows}
            onAddWorkflow={(wf) => setWorkflows([wf, ...workflows])}
            lang={lang}
            viewMode={viewMode}
          />
        )}

        {activePage === "runs" && (
          <RunsPage
            runs={runs}
            approvals={approvals}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            lang={lang}
            viewMode={viewMode}
          />
        )}

        {activePage === "evaluations" && (
          <EvaluationsPage
            metrics={evaluations}
            lang={lang}
            viewMode={viewMode}
          />
        )}

        {activePage === "settings" && (
          <SettingsPage
            endpoints={endpoints}
            lang={lang}
          />
        )}

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
