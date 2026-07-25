export type UserRole = 'admin' | 'developer' | 'operator' | 'viewer';
export type AppLanguage = 'zh' | 'en';
export type AppTheme = 'dark' | 'light';
export type ViewMode = 'business' | 'expert';
export type AppEnvironment = 'dev' | 'staging' | 'prod';
export type FontSize = 'normal' | 'large' | 'xlarge';
export type SpacingMode = 'compact' | 'comfortable' | 'spacious';

export interface AgentVersion {
  version: string;
  releaseStatus: 'draft' | 'staging' | 'production' | 'deprecated';
  changelog: string;
  author: string;
  createdAt: string;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number; // e.g. 3 consecutive failures
  resetTimeoutSec: number;  // e.g. 60 seconds
  fallbackAgentId?: string;
  fallbackMessage?: string;
}

export interface SyncJob {
  id: string;
  sourceId: string;
  sourceName: string;
  status: 'running' | 'completed' | 'failed';
  totalDocs: number;
  syncedDocs: number;
  failedDocs: number;
  errorMessage?: string;
  timestamp: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'json';
  transform?: string;
  isPrimaryKey?: boolean;
}

export interface EvalDataset {
  id: string;
  name: string;
  description: string;
  category: 'RAG' | 'Agent' | 'Tool' | 'EndToEnd';
  sampleCount: number;
  lastRunScore: number;
  updatedAt: string;
}

export interface RbacRole {
  id: UserRole;
  name: string;
  description: string;
  permissions: {
    agents: ('view' | 'create' | 'edit' | 'delete' | 'publish')[];
    knowledge: ('view' | 'upload' | 'sync' | 'delete')[];
    tools: ('view' | 'execute' | 'configure')[];
    workflows: ('view' | 'edit' | 'execute')[];
    approvals: ('view' | 'approve')[];
    settings: ('view' | 'configure')[];
  };
}

export type NavPageId = 
  | 'workspace'
  | 'agents'
  | 'knowledge'
  | 'tools'
  | 'connectors'
  | 'workflows'
  | 'runs'
  | 'evaluations'
  | 'settings';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'audio';
  url: string;
  size?: string;
}

export interface Citation {
  id: string;
  docTitle: string;
  section: string;
  excerpt: string;
  similarity: number;
  page?: number;
  sourceType?: 'IPMS' | 'DB' | 'DOC' | 'WEB' | 'TOOL' | 'AGENT';
  kbId?: string;
  chunkId?: string;
}

export interface ExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  durationMs: number;
  detail: string;
  chunks?: Citation[];
  toolInput?: Record<string, any>;
  toolOutput?: Record<string, any>;
  agentName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  executionSteps?: ExecutionStep[];
  steps?: ExecutionStep[];
  citations?: Citation[];
  latencyMs?: number;
  tokens?: number;
  model?: string;
  attachments?: Attachment[];
  audioBase64?: string;
  isAiGenerated?: boolean;
  approvalRequest?: ApprovalRequest;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  totalTokens: number;
  isPinned: boolean;
  tags: string[];
  model: string;
  agentId?: string;
  messages: ChatMessage[];
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'Internal' | 'External' | 'Supervisor' | 'Specialist' | 'Workflow' | 'HumanAssisted';
  department: string;
  status: 'active' | 'maintenance' | 'draft' | 'offline';
  version: string;
  versions?: AgentVersion[];
  circuitBreaker?: CircuitBreakerConfig;
  model: string;
  systemPrompt: string;
  planningMode: 'auto' | 'react' | 'plan_and_execute' | 'sequential';
  knowledgeBaseIds: string[];
  toolIds: string[];
  childAgentIds: string[];
  connectorIds: string[];
  workflowIds: string[];
  protocolType?: 'HTTP' | 'SSE' | 'WebSocket' | 'A2A' | 'MCP' | 'OpenAI' | 'LangGraph' | 'Dify' | 'Internal';
  endpoint?: string;
  authType?: 'None' | 'APIKey' | 'Bearer' | 'OAuth2';
  healthStatus?: 'Healthy' | 'Degraded' | 'Offline';
  latencyMs?: number;
  successRate: number;
  totalRuns: number;
  lastRunTime: string;
  isExternal?: boolean;
  // External Agent Wizard Configuration
  inputSchema?: string;
  outputSchema?: string;
  capabilities?: string[];
  timeoutMs?: number;
  retryCount?: number;
  fallbackBehavior?: 'default_llm' | 'circuit_breaker' | 'human_escalate';
  credentialId?: string;
  maskedSecret?: string;
  dataSourceType?: 'LIVE' | 'MOCK' | 'SIMULATED' | 'NOT_CONNECTED';
}

export interface ToolDefinition {
  id: string;
  name: string;
  type: 'Database' | 'HTTP' | 'Python' | 'SQL' | 'Browser' | 'File' | 'Email' | 'IPMS' | 'Ticket' | 'MCP' | 'Custom';
  description: string;
  department: string;
  status: 'active' | 'deprecated' | 'testing';
  inputSchema: string;
  outputSchema: string;
  requiresApproval: boolean;
  avgLatencyMs: number;
  successRate: number;
  usageCount: number;
  usedByAgentCount: number;
  connectorId?: string;
  credentialId?: string;
  maskedSecret?: string;
  dataSourceType?: 'LIVE' | 'MOCK' | 'SIMULATED' | 'NOT_CONNECTED';
}

export interface BuiltInModule {
  id: string;
  name: string;
  category: '基础模组' | 'RAG 模组' | 'Agent 模组' | '数据处理模组' | '企业模组';
  description: string;
  inputSchema: string;
  outputSchema: string;
  configParams: Record<string, any>;
  version: string;
  status: 'active' | 'deprecated' | 'testing';
  usedByAgents: string[];
  usedByWorkflows: string[];
  logs?: { timestamp: string; status: 'success' | 'failed'; detail: string }[];
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  type: 'SQLServer' | 'MySQL' | 'PostgreSQL' | 'Oracle' | 'REST_API' | 'Webhook' | 'IPMS' | 'SharePoint' | 'GitHub' | 'FileShare' | 'Email' | 'OA' | 'ERP';
  endpoint: string;
  department: string;
  status: 'connected' | 'disconnected' | 'error';
  syncPolicy: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSyncTime: string;
  readOnly: boolean;
  credentialId?: string;
  maskedSecret?: string;
  dataSourceType?: 'LIVE' | 'MOCK' | 'SIMULATED' | 'NOT_CONNECTED';
}

export interface KnowledgeBase {
  id: string;
  name: string;
  department: string;
  description: string;
  sourceCount: number;
  docCount: number;
  chunkCount: number;
  lastSynced: string;
  usedByAgentsCount: number;
  status: 'indexed' | 'syncing' | 'error';
}

export interface KnowledgeSource {
  id: string;
  kbId?: string;
  name: string;
  type: 'SQL Server' | 'File Upload' | 'SharePoint' | 'REST API' | 'IPMS Database';
  department: string;
  readOnly: boolean;
  syncMode: 'Realtime' | 'Hourly' | 'Daily';
  lastSync: string;
  addedCount: number;
  status: 'Connected' | 'Syncing' | 'Error';
  fieldMappings?: FieldMapping[];
}

export interface RAGDocument {
  id: string;
  title: string;
  type: 'pdf' | 'markdown' | 'txt' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'image';
  size: string;
  uploadDate: string;
  chunksCount: number;
  status: 'indexed' | 'processing' | 'failed';
  category: string;
  department: string;
  kbId?: string;
  excelConfig?: {
    sheetName: string;
    headerRow: number;
    primaryKey: string;
  };
  pdfConfig?: {
    enableOcr: boolean;
    extractTables: boolean;
  };
}

export interface RAGChunk {
  id: string;
  docId: string;
  docName: string;
  title: string;
  content: string;
  score: number;
  vectorScore?: number;
  bm25Score?: number;
  rerankScore?: number;
  category: string;
  department: string;
  page?: number;
  kbId?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: '现场问题处置' | 'Excel 办公辅助' | '知识库检索' | '工作流生成' | '自定义';
  description: string;
  promptText: string;
  variables: string[];
  department?: string;
}

export interface OpenApiEndpoint {
  id: string;
  name: string;
  method: 'POST' | 'GET' | 'PUT';
  path: string;
  description: string;
  departmentScope: string;
  status: 'active' | 'reserved';
  sampleRequest: string;
  sampleResponse: string;
}

export interface WorkflowNode {
  id: string;
  type: 'input' | 'agent' | 'external_agent' | 'rag' | 'tool' | 'llm' | 'code' | 'condition' | 'parallel' | 'approval' | 'output' | 'filter';
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  status?: 'idle' | 'queued' | 'running' | 'success' | 'failed' | 'waiting_approval';
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  lastRun?: string;
  status: 'active' | 'draft' | 'paused';
  department?: string;
}

export interface AgentPlugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'Search' | 'Development' | 'Data' | 'Communication' | 'Location';
  config: Record<string, string>;
}

export interface RunTraceStep {
  id: string;
  stepName: string;
  type: 'intent' | 'agent' | 'rag' | 'tool' | 'approval' | 'response';
  durationMs: number;
  status: 'success' | 'failed' | 'pending' | 'waiting_approval';
  detail: string;
}

export interface RunRecord {
  id: string;
  user: string;
  agentName: string;
  agentId: string;
  taskSummary: string;
  startTime: string;
  durationMs: number;
  status: 'completed' | 'running' | 'failed' | 'needs_approval';
  tokensUsed: number;
  costUsd: number;
  kbsUsed: string[];
  toolsCalled: string[];
  childAgentsCalled: string[];
  traceSteps: RunTraceStep[];
}

export interface ApprovalRequest {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string;
  actionTitle: string;
  description: string;
  params: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  timestamp: string;
}

export interface EvaluationMetric {
  id: string;
  category: 'RAG' | 'Agent' | 'Tool';
  metricName: string;
  score: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export interface SystemMetrics {
  totalRequests: number;
  avgLatencyMs: number;
  ragHitRate: number;
  tokenCount: number;
  activeAgents: number;
  errorCount: number;
  qpsHistory: { time: string; qps: number; latency: number }[];
  tokenUsageHistory: { time: string; promptTokens: number; completionTokens: number }[];
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  source: string;
  message: string;
  stackTrace?: string;
}

export interface TestResult {
  id: string;
  testName: string;
  passed: boolean;
  latencyMs: number;
  similarityScore: number;
  timestamp: string;
}
