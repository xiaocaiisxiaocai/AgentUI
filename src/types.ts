export type UserRole = 'admin' | 'developer' | 'viewer';
export type AppLanguage = 'zh' | 'en';
export type AppTheme = 'dark' | 'light';

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
}

export interface ExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs: number;
  detail: string;
  chunks?: Citation[];
  toolInput?: Record<string, any>;
  toolOutput?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  executionSteps?: ExecutionStep[];
  citations?: Citation[];
  latencyMs?: number;
  tokens?: number;
  model?: string;
  attachments?: Attachment[];
  audioBase64?: string;
  isAiGenerated?: boolean;
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
  messages: ChatMessage[];
}

export interface RAGDocument {
  id: string;
  title: string;
  type: 'pdf' | 'markdown' | 'txt' | 'docx';
  size: string;
  uploadDate: string;
  chunksCount: number;
  status: 'indexed' | 'processing' | 'failed';
  category: string;
  department: string; // 部门隔离维度，例如：售后技术部、运营助理部、通用行政部
}

export interface RAGChunk {
  id: string;
  docId: string;
  docName: string;
  title: string;
  content: string;
  score: number;
  category: string;
  department: string;
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
  type: 'input' | 'rag' | 'llm' | 'code' | 'filter' | 'plugin' | 'output';
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
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
