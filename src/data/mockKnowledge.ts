import { RAGDocument, RAGChunk, PromptTemplate, Workflow, AgentPlugin, SystemMetrics, ErrorLog, TestResult, OpenApiEndpoint } from "../types";

export const initialDocuments: RAGDocument[] = [
  {
    id: "doc-1",
    title: "售后技术部_客户现场常见故障排查与应急处置手册_v3.2.pdf",
    type: "pdf",
    size: "4.2 MB",
    uploadDate: "2026-07-20",
    chunksCount: 42,
    status: "indexed",
    category: "现场问题排查",
    department: "售后技术部",
  },
  {
    id: "doc-2",
    title: "运营助理部_日常Excel高效办公公式与数据汇总技巧指南.md",
    type: "markdown",
    size: "820 KB",
    uploadDate: "2026-07-22",
    chunksCount: 18,
    status: "indexed",
    category: "Excel 办公指南",
    department: "运营助理部",
  },
  {
    id: "doc-3",
    title: "售后技术部_现场PLC通讯超时与网络凭证失效处置记录.docx",
    type: "docx",
    size: "1.8 MB",
    uploadDate: "2026-07-18",
    chunksCount: 26,
    status: "indexed",
    category: "网络故障案例",
    department: "售后技术部",
  },
  {
    id: "doc-4",
    title: "通用行政部_企业内部报销规范与差旅审批标准2026.pdf",
    type: "pdf",
    size: "2.5 MB",
    uploadDate: "2026-07-23",
    chunksCount: 30,
    status: "indexed",
    category: "行政审批规范",
    department: "通用行政部",
  },
];

export const initialChunks: RAGChunk[] = [
  {
    id: "chunk-101",
    docId: "doc-1",
    docName: "售后技术部_客户现场常见故障排查与应急处置手册_v3.2.pdf",
    title: "§ 3.2 现场设备通讯中断与 504 Gateway Timeout 紧急修复规程",
    content: "当客户现场终端出现 504 网关超时或 PLC 报文丢失时：1. 检查现场控制箱 24V 供电；2. 执行 `ping 192.168.10.100` 确认局域网链路；3. 若网卡物理打通但报文丢失，复位局域网网关交换机，并重新导入通讯凭证秘钥证书。",
    score: 0.96,
    category: "现场问题排查",
    department: "售后技术部",
  },
  {
    id: "chunk-102",
    docId: "doc-2",
    docName: "运营助理部_日常Excel高效办公公式与数据汇总技巧指南.md",
    title: "§ 2.4 跨表格动态数据匹配与 XLOOKUP 多条件批量查找公式",
    content: "助理处理多表比对时，推荐使用 `=XLOOKUP(A2&B2, 客户表!A:A&客户表!B:B, 客户表!C:C, \"未找到记录\")`。相比传统 VLOOKUP，XLOOKUP 不受列位置限制，且不会因插列导致公式报错，大幅提升多部门表格合并效率。",
    score: 0.93,
    category: "Excel 办公指南",
    department: "运营助理部",
  },
  {
    id: "chunk-103",
    docId: "doc-3",
    docName: "售后技术部_现场PLC通讯超时与网络凭证失效处置记录.docx",
    title: "§ 1.1 客户现场历史异常问题归档：以太网卡双工模式不匹配",
    content: "2026年5月华东客户现场报告设备间歇性掉线。排查发现客户交换机强制设为 100M Full-Duplex，而我方终端设为 Auto-Negotiation。修改以太网适配器配置为 100M 全双工后恢复稳定，该处理办法已沉淀至技术知识库。",
    score: 0.89,
    category: "网络故障案例",
    department: "售后技术部",
  },
  {
    id: "chunk-104",
    docId: "doc-4",
    docName: "通用行政部_企业内部报销规范与差旅审批标准2026.pdf",
    title: "§ 4.1 现场工程师差旅补贴与发票抬头开具要求",
    content: "售后现场工程师出差享受每日 180 元餐补与交通补贴。报销发票抬头必须包含公司完整纳税人识别号，机票/火车票行程单须上传至 OA 系统由部门主管审批。",
    score: 0.85,
    category: "行政审批规范",
    department: "通用行政部",
  },
];

export const initialPromptTemplates: PromptTemplate[] = [
  {
    id: "prompt-1",
    title: "🛠️ 客户现场故障诊断与历史处方检索",
    category: "现场问题处置",
    description: "输入现场报错现象或代码，从历史资料库中匹配对应解决办法并生成排查步骤。",
    promptText: "请作为售后技术支持专家，检索知识库中历史客户现场案例：\n1. 分析现场报错现象【{issue_desc}】；\n2. 从历史资料中给出最匹配的 2 种处置方案；\n3. 梳理按步骤操作的应急复原 CheckList。",
    variables: ["issue_desc", "device_model"],
    department: "售后技术部",
  },
  {
    id: "prompt-2",
    title: "📊 Excel 复杂公式编写与数据合并助手",
    category: "Excel 办公辅助",
    description: "描述想要的表格计算需求，自动生成精确的 Excel 函数公式（XLOOKUP/SUMIFS/VSTACK）并附带操作说明。",
    promptText: "请作为 Excel 办公自动化专家，帮助运营助理编写数据处理公式：\n- 计算需求：【{requirement}】\n- 请给出最优雅的 Excel 函数公式；\n- 解释公式中各个参数的含义及防报错处理技巧（如 IFERROR）。",
    variables: ["requirement", "excel_version"],
    department: "运营助理部",
  },
  {
    id: "prompt-3",
    title: "📝 客户现场服务单与事故小结报告生成",
    category: "现场问题处置",
    description: "将散乱的现场排查日志整理为规范的客户现场技术服务报告与部门归档案例。",
    promptText: "请将以下现场排查日志【{raw_logs}】整理为标准《客户现场技术服务报告》：\n- 包含：问题现象、根因分析、解决办法、预防再发措施。\n- 语言要求客观专业，符合企业归档标准。",
    variables: ["raw_logs", "client_name"],
    department: "售后技术部",
  },
  {
    id: "prompt-4",
    title: "✉️ 客户回复邮件与沟通话术整理",
    category: "Excel 办公辅助",
    description: "将技术排查结果转化为面向客户的得体沟通邮件与标准答复话术。",
    promptText: "请将技术部门提供的故障排查结论【{tech_result}】转化为向客户【{client_name}】报告的正式沟通邮件，要求表达礼貌、措辞严谨并提供明确后续进度计划。",
    variables: ["tech_result", "client_name"],
    department: "运营助理部",
  },
];

export const initialOpenApiEndpoints: OpenApiEndpoint[] = [
  {
    id: "api-1",
    name: "Agent 智能问答通用接口 (Agent Query API)",
    method: "POST",
    path: "/api/v1/agent/query",
    description: "供外部第三方 Agent、OA 或 ERP 系统通过 REST HTTP 调用，向部门 Agent 发起问答检索。",
    departmentScope: "全局开放 (支持各部门隔离 Key)",
    status: "active",
    sampleRequest: `{\n  "query": "客户现场 PLC 通讯超时怎么解决？",\n  "department": "售后技术部",\n  "topK": 3,\n  "stream": true\n}`,
    sampleResponse: `{\n  "status": "success",\n  "answer": "根据售后技术部手册 §3.2，首先检查控制箱 24V 供电...",\n  "citations": [\n    { "docTitle": "客户现场手册.pdf", "similarity": 0.96 }\n  ]\n}`
  },
  {
    id: "api-2",
    name: "部门 RAG 知识向量注入接口 (Ingest API)",
    method: "POST",
    path: "/api/v1/rag/departments/{dept_id}/ingest",
    description: "支持各部门定时同步导入本地历史文档，自动分块并构建向量索引。",
    departmentScope: "预留多部门隔离维度",
    status: "active",
    sampleRequest: `{\n  "docTitle": "2026年6月现场异常处理复盘.docx",\n  "departmentId": "dept-tech-aftersales",\n  "content": "现场发现新硬件兼容性问题...",\n  "category": "现场故障"\n}`,
    sampleResponse: `{\n  "status": "indexed",\n  "chunksCreated": 12,\n  "vectorCollection": "col_dept_aftersales_v1"\n}`
  },
  {
    id: "api-3",
    name: "Excel 自动化脚本与公式执行接口 (Excel Bot Hook)",
    method: "POST",
    path: "/api/v1/tools/excel/formula-generate",
    description: "专供助理自动化机器人调用，传入自然语言生成可直接粘贴的 Excel 表达式。",
    departmentScope: "运营助理部",
    status: "active",
    sampleRequest: `{\n  "prompt": "合并部门列和员工列，查找销售额",\n  "targetSheet": "2026汇总表.xlsx"\n}`,
    sampleResponse: `{\n  "formula": "=XLOOKUP(A2&B2, 销售!A:A&销售!B:B, 销售!C:C)",\n  "explanation": "双条件匹配表达式"\n}`
  },
  {
    id: "api-4",
    name: "第三方 Agent 级联回调 Webhook (Secondary Agent Webhook)",
    method: "POST",
    path: "/api/v1/webhooks/agent-cascade",
    description: "预留多 Agent 协同接口，当本部门 Agent 无法解决时自动推送到外部二次 Agent。",
    departmentScope: "预留扩展接口",
    status: "reserved",
    sampleRequest: `{\n  "event": "unresolved_query",\n  "query": "涉及财务报销特殊例外",\n  "callbackUrl": "https://oa.company.com/webhook/finance-agent"\n}`,
    sampleResponse: `{\n  "eventHandled": true,\n  "routedTo": "finance_agent_v2"\n}`
  }
];

export const initialWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "客户现场故障排查与自动解答流水线",
    description: "接收售后现场报错 -> 检索售后技术部知识库 -> 提取历史处方 -> 自动输出步骤 CheckList。",
    status: "active",
    lastRun: "2026-07-24 08:20",
    nodes: [
      { id: "n1", type: "input", label: "1. 接收现场报错描述", position: { x: 50, y: 150 }, config: { source: "现场工程师输入" } },
      { id: "n2", type: "rag", label: "2. 售后技术部 RAG 检索", position: { x: 280, y: 150 }, config: { dept: "售后技术部", topK: 3 } },
      { id: "n3", type: "llm", label: "3. 故障诊断生成引擎", position: { x: 520, y: 150 }, config: { model: "gemini-3.6-flash", temp: 0.3 } },
      { id: "n4", type: "code", label: "4. Python 规范化格式化", position: { x: 760, y: 150 }, config: { lang: "python" } },
      { id: "n5", type: "output", label: "5. 输出现场处置 CheckList", position: { x: 1000, y: 150 }, config: { format: "Markdown" } },
    ],
    edges: [
      { id: "e1-2", source: "n1", target: "n2" },
      { id: "e2-3", source: "n2", target: "n3" },
      { id: "e3-4", source: "n3", target: "n4" },
      { id: "e4-5", source: "n4", target: "n5" },
    ],
  },
  {
    id: "wf-2",
    name: "助理 Excel 数据处理与格式校验流水线",
    description: "输入数据整理需求 -> 匹配助理部公式指南 -> 生成 Excel 表达式与操作要点。",
    status: "draft",
    lastRun: "2026-07-23 14:10",
    nodes: [
      { id: "n10", type: "input", label: "表格计算需求输入", position: { x: 50, y: 120 }, config: {} },
      { id: "n11", type: "rag", label: "运营助理部知识库", position: { x: 280, y: 120 }, config: { dept: "运营助理部" } },
      { id: "n12", type: "llm", label: "Gemini 公式推理", position: { x: 520, y: 120 }, config: {} },
      { id: "n13", type: "output", label: "输出表达式与案例", position: { x: 760, y: 120 }, config: {} },
    ],
    edges: [
      { id: "e10-11", source: "n10", target: "n11" },
      { id: "e11-12", source: "n11", target: "n12" },
      { id: "e12-13", source: "n12", target: "n13" },
    ],
  }
];

export const initialPlugins: AgentPlugin[] = [
  {
    id: "plugin-openapi-gateway",
    name: "OpenAPI Agent 接入网关",
    description: "开放 RESTful HTTP 与 Webhook 接口，方便第三方的 OA、ERP 或其他 Agent 调起本系统。",
    icon: "Plug",
    enabled: true,
    category: "Development",
    config: { port: "8080/v1/openapi", status: "Active" },
  },
  {
    id: "plugin-excel-sandbox",
    name: "Excel 代码与公式沙盒引擎",
    description: "内置 Python OpenPyXL 与 Excel 公式解析器，为助理提供函数验证与数据清洗能力。",
    icon: "FileSpreadsheet",
    enabled: true,
    category: "Development",
    config: { engine: "Python 3.11 + OpenPyXL Sandbox" },
  },
  {
    id: "plugin-field-kb-vector",
    name: "现场历史资料 Vector 检索引擎",
    description: "支持跨 PDF/Word 手册的毫秒级切片召回，精准匹配历史故障现象与处置药方。",
    icon: "Database",
    enabled: true,
    category: "Data",
    config: { index: "dept_field_knowledge_v1" },
  },
  {
    id: "plugin-workmail-dispatcher",
    name: "企业微信/钉钉工单通知推送",
    description: "当处理完成高优先级的现场紧急故障或生成完汇总报表时，自动推送到部门群。",
    icon: "Mail",
    enabled: true,
    category: "Communication",
    config: { channel: "企业微信机器人 / Webhook" },
  }
];

export const initialMetrics: SystemMetrics = {
  totalRequests: 1860,
  avgLatencyMs: 920,
  ragHitRate: 96.2,
  tokenCount: 1850000,
  activeAgents: 4,
  errorCount: 1,
  qpsHistory: [
    { time: "00:00", qps: 8, latency: 780 },
    { time: "04:00", qps: 3, latency: 710 },
    { time: "08:00", qps: 45, latency: 920 },
    { time: "12:00", qps: 78, latency: 1050 },
    { time: "16:00", qps: 62, latency: 960 },
    { time: "20:00", qps: 32, latency: 840 },
    { time: "24:00", qps: 14, latency: 790 },
  ],
  tokenUsageHistory: [
    { time: "Mon", promptTokens: 280000, completionTokens: 140000 },
    { time: "Tue", promptTokens: 350000, completionTokens: 180000 },
    { time: "Wed", promptTokens: 320000, completionTokens: 160000 },
    { time: "Thu", promptTokens: 450000, completionTokens: 220000 },
    { time: "Fri", promptTokens: 510000, completionTokens: 260000 },
    { time: "Sat", promptTokens: 150000, completionTokens: 80000 },
    { time: "Sun", promptTokens: 120000, completionTokens: 60000 },
  ]
};

export const initialErrorLogs: ErrorLog[] = [
  {
    id: "err-1",
    timestamp: "2026-07-24 01:12:45",
    level: "info",
    source: "OpenAPI Gateway",
    message: "第三方 Agent 尝试调用 /api/v1/agent/query，身份验证成功，返回状态 200 OK。",
  }
];

export const initialTestResults: TestResult[] = [
  {
    id: "test-1",
    testName: "售后技术部现场故障匹配召回率测试",
    passed: true,
    latencyMs: 780,
    similarityScore: 0.96,
    timestamp: "2026-07-24 01:00",
  },
  {
    id: "test-2",
    testName: "运营助理部 Excel 公式逻辑正确性生成测试",
    passed: true,
    latencyMs: 890,
    similarityScore: 0.95,
    timestamp: "2026-07-24 01:02",
  },
  {
    id: "test-3",
    testName: "OpenAPI 网关 JSON 接口吞吐量与权限隔离测试",
    passed: true,
    latencyMs: 420,
    similarityScore: 0.98,
    timestamp: "2026-07-24 01:05",
  }
];
