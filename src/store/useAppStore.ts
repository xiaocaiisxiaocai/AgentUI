import { create } from 'zustand';
import {
  UserRole,
  AppLanguage,
  AppTheme,
  ViewMode,
  AppEnvironment,
  AgentDefinition,
  ToolDefinition,
  ConnectorDefinition,
  KnowledgeBase,
  KnowledgeSource,
  SyncJob,
  FieldMapping,
  RAGDocument,
  RAGChunk,
  Workflow,
  RunRecord,
  ApprovalRequest,
  EvaluationMetric,
  EvalDataset,
  RbacRole,
  OpenApiEndpoint,
  ChatMessage,
  Citation,
  AgentVersion,
  CircuitBreakerConfig
} from '../types';

import {
  initialAgents,
  initialTools,
  initialConnectors,
  initialKnowledgeBases,
  initialKnowledgeSources,
  initialRuns,
  initialApprovals,
  initialEvaluations
} from '../data/mockEnterpriseData';

import {
  initialDocuments,
  initialChunks,
  initialWorkflows,
  initialOpenApiEndpoints
} from '../data/mockKnowledge';

// Initial Sync Jobs
const initialSyncJobs: SyncJob[] = [
  {
    id: 'job-101',
    sourceId: 'source-ipms-db',
    sourceName: 'IPMS 售后故障分析库',
    status: 'completed',
    totalDocs: 1250,
    syncedDocs: 1250,
    failedDocs: 0,
    timestamp: '2026-07-24 09:30:00',
  },
  {
    id: 'job-102',
    sourceId: 'source-sql-server',
    sourceName: 'SQL Server 设备主数据视图',
    status: 'failed',
    totalDocs: 450,
    syncedDocs: 412,
    failedDocs: 38,
    errorMessage: '网络高延迟超时: 数据库连接在执行 Batch Chunking 时中断 [Socket Timeout]',
    timestamp: '2026-07-24 08:15:22',
  },
  {
    id: 'job-103',
    sourceId: 'source-sharepoint',
    sourceName: 'SharePoint 研发工程规范库',
    status: 'running',
    totalDocs: 800,
    syncedDocs: 540,
    failedDocs: 0,
    timestamp: '2026-07-24 10:02:11',
  }
];

// Initial Eval Datasets
const initialEvalDatasets: EvalDataset[] = [
  {
    id: 'ds-01',
    name: 'IPMS 现场故障召回测试集 (Gold Standard)',
    description: '包含 500 个真实售后工单和工程师标记的标准上下文段落',
    category: 'RAG',
    sampleCount: 500,
    lastRunScore: 94.2,
    updatedAt: '2026-07-23',
  },
  {
    id: 'ds-02',
    name: '工单生成 Agent 工具调用准确率基准集',
    description: '测试 Agent 对带参数 SQL 检索与确认拦截写调用的意图捕获',
    category: 'Agent',
    sampleCount: 200,
    lastRunScore: 96.8,
    updatedAt: '2026-07-22',
  },
  {
    id: 'ds-03',
    name: '跨部门权限隔离安全防御基准集',
    description: '验证不同角色跨越无权部门访问敏感数据的拒绝与拦截率',
    category: 'EndToEnd',
    sampleCount: 150,
    lastRunScore: 99.5,
    updatedAt: '2026-07-24',
  }
];

// Initial RBAC Roles
const initialRbacRoles: RbacRole[] = [
  {
    id: 'admin',
    name: '系统管理员 (System Admin)',
    description: '具有对全域 Agent、知识库、工具网关与全链审批准入的完整控制特权。',
    permissions: {
      agents: ['view', 'create', 'edit', 'delete', 'publish'],
      knowledge: ['view', 'upload', 'sync', 'delete'],
      tools: ['view', 'execute', 'configure'],
      workflows: ['view', 'edit', 'execute'],
      approvals: ['view', 'approve'],
      settings: ['view', 'configure']
    }
  },
  {
    id: 'developer',
    name: 'AI 架构师 / 开发工程师 (AI Engineer)',
    description: '负责 Agent Prompt 调试、工具与 Connector 绑定、工作流编排与评测跑分。',
    permissions: {
      agents: ['view', 'create', 'edit', 'publish'],
      knowledge: ['view', 'upload', 'sync'],
      tools: ['view', 'execute', 'configure'],
      workflows: ['view', 'edit', 'execute'],
      approvals: ['view'],
      settings: ['view']
    }
  },
  {
    id: 'operator',
    name: '业务运营人员 (Business Operator)',
    description: '可以在 Workspace 对话协同、使用已发布的 Agent、查看知识文档与发起工单。',
    permissions: {
      agents: ['view'],
      knowledge: ['view', 'upload'],
      tools: ['view', 'execute'],
      workflows: ['view', 'execute'],
      approvals: ['view'],
      settings: ['view']
    }
  },
  {
    id: 'viewer',
    name: '安全与合规审计员 (Auditor)',
    description: '仅具备只读访问权限，重点查看 Run 链路日志、评估指标与高危操作审批记录。',
    permissions: {
      agents: ['view'],
      knowledge: ['view'],
      tools: ['view'],
      workflows: ['view'],
      approvals: ['view'],
      settings: ['view']
    }
  }
];

interface AppState {
  // Config
  lang: AppLanguage;
  theme: AppTheme;
  viewMode: ViewMode;
  userRole: UserRole;
  environment: AppEnvironment;
  selectedDept: string;

  // Entities
  agents: AgentDefinition[];
  currentAgentId: string;
  tools: ToolDefinition[];
  connectors: ConnectorDefinition[];
  knowledgeBases: KnowledgeBase[];
  knowledgeSources: KnowledgeSource[];
  syncJobs: SyncJob[];
  documents: RAGDocument[];
  chunks: RAGChunk[];
  workflows: Workflow[];
  runs: RunRecord[];
  approvals: ApprovalRequest[];
  evaluations: EvaluationMetric[];
  evalDatasets: EvalDataset[];
  rbacRoles: RbacRole[];
  endpoints: OpenApiEndpoint[];

  // Chat
  messages: ChatMessage[];
  isGenerating: boolean;

  // Inspector
  isInspectorOpen: boolean;
  inspectorTab: 'context' | 'sources' | 'agents' | 'tools' | 'trace' | 'topology';
  selectedCitation: Citation | null;

  // Actions
  setLang: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setViewMode: (mode: ViewMode) => void;
  setUserRole: (role: UserRole) => void;
  setEnvironment: (env: AppEnvironment) => void;
  setSelectedDept: (dept: string) => void;
  setCurrentAgentId: (id: string) => void;

  // Agent Mutations
  addAgent: (agent: AgentDefinition) => void;
  updateAgent: (agent: AgentDefinition) => void;
  deleteAgent: (id: string) => void;
  toggleAgentKnowledgeBase: (agentId: string, kbId: string) => void;
  toggleAgentTool: (agentId: string, toolId: string) => void;
  toggleAgentChildAgent: (agentId: string, childId: string) => void;
  updateAgentVersion: (agentId: string, newVersion: AgentVersion) => void;
  updateAgentCircuitBreaker: (agentId: string, config: CircuitBreakerConfig) => void;

  // Knowledge & Sync
  addDocument: (doc: RAGDocument) => void;
  addKnowledgeSource: (source: KnowledgeSource) => void;
  updateFieldMappings: (sourceId: string, mappings: FieldMapping[]) => void;
  triggerSyncJob: (sourceId: string) => void;

  // Tools & Connectors
  addTool: (tool: ToolDefinition) => void;
  addConnector: (connector: ConnectorDefinition) => void;

  // Workflows
  addWorkflow: (wf: Workflow) => void;
  updateWorkflow: (wf: Workflow) => void;

  // Approvals & Runs
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;

  // Chat Actions
  sendMessage: (queryText: string) => Promise<void>;

  // Inspector Actions
  toggleInspector: () => void;
  setIsInspectorOpen: (open: boolean) => void;
  setInspectorTab: (tab: 'context' | 'sources' | 'agents' | 'tools' | 'trace' | 'topology') => void;
  setSelectedCitation: (citation: Citation | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  lang: 'zh',
  theme: 'dark',
  viewMode: 'business',
  userRole: 'admin',
  environment: 'staging',
  selectedDept: '全部试点部门',

  agents: initialAgents,
  currentAgentId: 'agent-supervisor',
  tools: initialTools,
  connectors: initialConnectors,
  knowledgeBases: initialKnowledgeBases,
  knowledgeSources: initialKnowledgeSources,
  syncJobs: initialSyncJobs,
  documents: initialDocuments,
  chunks: initialChunks,
  workflows: initialWorkflows,
  runs: initialRuns,
  approvals: initialApprovals,
  evaluations: initialEvaluations,
  evalDatasets: initialEvalDatasets,
  rbacRoles: initialRbacRoles,
  endpoints: initialOpenApiEndpoints,

  messages: [
    {
      id: "msg-1",
      sender: "user",
      text: "客户现场 PLC 通讯超时 504 Gateway Timeout 怎么排查？请查阅售后技术部历史案例并准备向 IPMS 提交维修单。",
      timestamp: "09:14:05",
    },
    {
      id: "msg-2",
      sender: "agent",
      text: "根据**售后技术部 IPMS 历史故障知识库** §3.2 召回结论：\n\n1. **控制箱 24V 供电核查**：首先测量现场终端 24V 开关电源，排查降压与线缆松动；\n2. **Ping 连通性测试**：执行 `ping 192.168.10.100` 确认局域网物理链路打通；\n3. **网关复位与凭证重导入**：若打通但报文丢失，复位交换机并重新导入通信秘钥凭证。\n\n已为您自动构造 IPMS 特急维修工单草稿，涉及写接口，需您在待办中心进行确认核准。",
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
  ],
  isGenerating: false,

  isInspectorOpen: false,
  inspectorTab: 'context',
  selectedCitation: null,

  // Simple Setters
  setLang: (lang) => set({ lang }),
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  setViewMode: (viewMode) => set({ viewMode }),
  setUserRole: (userRole) => set({ userRole }),
  setEnvironment: (environment) => set({ environment }),
  setSelectedDept: (selectedDept) => set({ selectedDept }),
  setCurrentAgentId: (currentAgentId) => set({ currentAgentId }),

  // Agent Mutations
  addAgent: (agent) => set((s) => ({ agents: [agent, ...s.agents] })),
  updateAgent: (agent) => set((s) => ({
    agents: s.agents.map((a) => (a.id === agent.id ? agent : a))
  })),
  deleteAgent: (id) => set((s) => ({
    agents: s.agents.filter((a) => a.id !== id)
  })),

  toggleAgentKnowledgeBase: (agentId, kbId) => set((s) => ({
    agents: s.agents.map((a) => {
      if (a.id !== agentId) return a;
      const exists = a.knowledgeBaseIds.includes(kbId);
      const newKbIds = exists
        ? a.knowledgeBaseIds.filter((id) => id !== kbId)
        : [...a.knowledgeBaseIds, kbId];
      return { ...a, knowledgeBaseIds: newKbIds };
    })
  })),

  toggleAgentTool: (agentId, toolId) => set((s) => ({
    agents: s.agents.map((a) => {
      if (a.id !== agentId) return a;
      const exists = a.toolIds.includes(toolId);
      const newToolIds = exists
        ? a.toolIds.filter((id) => id !== toolId)
        : [...a.toolIds, toolId];
      return { ...a, toolIds: newToolIds };
    })
  })),

  toggleAgentChildAgent: (agentId, childId) => set((s) => ({
    agents: s.agents.map((a) => {
      if (a.id !== agentId) return a;
      const exists = a.childAgentIds.includes(childId);
      const newChildIds = exists
        ? a.childAgentIds.filter((id) => id !== childId)
        : [...a.childAgentIds, childId];
      return { ...a, childAgentIds: newChildIds };
    })
  })),

  updateAgentVersion: (agentId, newVersion) => set((s) => ({
    agents: s.agents.map((a) => {
      if (a.id !== agentId) return a;
      const versions = a.versions || [];
      return {
        ...a,
        version: newVersion.version,
        versions: [newVersion, ...versions],
      };
    })
  })),

  updateAgentCircuitBreaker: (agentId, config) => set((s) => ({
    agents: s.agents.map((a) => (a.id === agentId ? { ...a, circuitBreaker: config } : a))
  })),

  // Knowledge & Sync
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  addKnowledgeSource: (source) => set((s) => ({ knowledgeSources: [source, ...s.knowledgeSources] })),

  updateFieldMappings: (sourceId, mappings) => set((s) => ({
    knowledgeSources: s.knowledgeSources.map((src) =>
      src.id === sourceId ? { ...src, fieldMappings: mappings } : src
    )
  })),

  triggerSyncJob: (sourceId) => {
    const src = get().knowledgeSources.find((s) => s.id === sourceId);
    const newJob: SyncJob = {
      id: 'job-' + Date.now(),
      sourceId,
      sourceName: src?.name || '数据源',
      status: 'running',
      totalDocs: 500,
      syncedDocs: 0,
      failedDocs: 0,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    set((s) => ({ syncJobs: [newJob, ...s.syncJobs] }));

    // Simulate completion
    setTimeout(() => {
      set((s) => ({
        syncJobs: s.syncJobs.map((j) =>
          j.id === newJob.id
            ? { ...j, status: 'completed', syncedDocs: 500 }
            : j
        )
      }));
    }, 2000);
  },

  // Tools & Connectors
  addTool: (tool) => set((s) => ({ tools: [tool, ...s.tools] })),
  addConnector: (connector) => set((s) => ({ connectors: [connector, ...s.connectors] })),

  // Workflows
  addWorkflow: (wf) => set((s) => ({ workflows: [wf, ...s.workflows] })),
  updateWorkflow: (wf) => set((s) => ({
    workflows: s.workflows.map((w) => (w.id === wf.id ? wf : w))
  })),

  // Approvals & Runs
  approveRequest: (id) => {
    set((s) => ({
      approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
    }));

    const newRun: RunRecord = {
      id: "run-appr-" + Date.now(),
      user: "系统管理员 (Admin)",
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

    set((s) => ({ runs: [newRun, ...s.runs] }));
  },

  rejectRequest: (id) => {
    set((s) => ({
      approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    }));
  },

  // Chat
  sendMessage: async (queryText) => {
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      isGenerating: true,
    }));

    const currentAgent = get().agents.find((a) => a.id === get().currentAgentId) || get().agents[0];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          agentId: currentAgent.id,
          department: get().selectedDept,
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

      set((s) => ({
        messages: [...s.messages, agentMsg],
      }));
    } catch (err) {
      const fallbackAgentMsg: ChatMessage = {
        id: "msg-fallback-" + Date.now(),
        sender: "agent",
        text: `根据【${currentAgent.department}】知识库及历史资料归档结论：\n\n处理办法：优先测量控制箱 24V 供电；检查以太网适配器全双工/半双工模式；尝试进行复位重连。`,
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
      set((s) => ({
        messages: [...s.messages, fallbackAgentMsg],
      }));
    } finally {
      set({ isGenerating: false });
    }
  },

  // Inspector
  toggleInspector: () => set((s) => ({ isInspectorOpen: !s.isInspectorOpen })),
  setIsInspectorOpen: (isInspectorOpen) => set({ isInspectorOpen }),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
  setSelectedCitation: (selectedCitation) => set({ selectedCitation }),
}));
