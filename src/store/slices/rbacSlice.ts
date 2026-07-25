import { StateCreator } from "zustand";
import { RbacRole, EvaluationMetric, EvalDataset } from "../../types";
import { initialEvaluations } from "../../data/mockEnterpriseData";

export const initialRbacRoles: RbacRole[] = [
  {
    id: "admin",
    name: "系统管理员 (System Admin)",
    description: "具有对全域 Agent、知识库、工具网关与全链审批准入的完整控制特权。",
    permissions: {
      agents: ["view", "create", "edit", "delete", "publish"],
      knowledge: ["view", "upload", "sync", "delete"],
      tools: ["view", "execute", "configure"],
      workflows: ["view", "edit", "execute"],
      approvals: ["view", "approve"],
      settings: ["view", "configure"],
    },
  },
  {
    id: "developer",
    name: "AI 架构师 / 开发工程师 (AI Engineer)",
    description: "负责 Agent Prompt 调试、工具与 Connector 绑定、工作流编排与评测跑分。",
    permissions: {
      agents: ["view", "create", "edit", "publish"],
      knowledge: ["view", "upload", "sync"],
      tools: ["view", "execute", "configure"],
      workflows: ["view", "edit", "execute"],
      approvals: ["view"],
      settings: ["view"],
    },
  },
  {
    id: "operator",
    name: "业务运营人员 (Business Operator)",
    description: "可以在 Workspace 对话协同、使用已发布的 Agent、查看知识文档与发起工单。",
    permissions: {
      agents: ["view"],
      knowledge: ["view", "upload"],
      tools: ["view", "execute"],
      workflows: ["view", "execute"],
      approvals: ["view"],
      settings: ["view"],
    },
  },
  {
    id: "viewer",
    name: "安全与合规审计员 (Auditor)",
    description: "仅具备只读访问权限，重点查看 Run 链路日志、评估指标与高危操作审批记录。",
    permissions: {
      agents: ["view"],
      knowledge: ["view"],
      tools: ["view"],
      workflows: ["view"],
      approvals: ["view"],
      settings: ["view"],
    },
  },
];

export const initialEvalDatasets: EvalDataset[] = [
  {
    id: "ds-01",
    name: "IPMS 现场故障召回测试集 (Gold Standard)",
    description: "包含 500 个真实售后工单和工程师标记的标准上下文段落",
    category: "RAG",
    sampleCount: 500,
    lastRunScore: 94.2,
    updatedAt: "2026-07-23",
  },
  {
    id: "ds-02",
    name: "工单生成 Agent 工具调用准确率基准集",
    description: "测试 Agent 对带参数 SQL 检索与确认拦截写调用的意图捕获",
    category: "Agent",
    sampleCount: 200,
    lastRunScore: 96.8,
    updatedAt: "2026-07-22",
  },
  {
    id: "ds-03",
    name: "跨部门权限隔离安全防御基准集",
    description: "验证不同角色跨越无权部门访问敏感数据的拒绝与拦截率",
    category: "EndToEnd",
    sampleCount: 150,
    lastRunScore: 99.5,
    updatedAt: "2026-07-24",
  },
];

export interface RbacSlice {
  rbacRoles: RbacRole[];
  evaluations: EvaluationMetric[];
  evalDatasets: EvalDataset[];

  // Helper
  checkPermission: (roleId: string, module: keyof RbacRole["permissions"], action: string) => boolean;
}

export const createRbacSlice: StateCreator<RbacSlice, [], [], RbacSlice> = (set, get) => ({
  rbacRoles: initialRbacRoles,
  evaluations: initialEvaluations,
  evalDatasets: initialEvalDatasets,

  checkPermission: (roleId, module, action) => {
    const role = get().rbacRoles.find((r) => r.id === roleId);
    if (!role) return false;
    const actions = role.permissions[module] || [];
    return actions.includes(action as any);
  },
});
