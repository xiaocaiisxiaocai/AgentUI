import { StateCreator } from "zustand";
import { ApprovalRequest, RunRecord } from "../../types";
import { initialApprovals } from "../../data/mockEnterpriseData";
import { RunSlice } from "./runSlice";

export interface ApprovalSlice {
  approvals: ApprovalRequest[];

  // Actions
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  addApprovalRequest: (req: ApprovalRequest) => void;
}

export const createApprovalSlice: StateCreator<
  ApprovalSlice & RunSlice,
  [],
  [],
  ApprovalSlice
> = (set, get) => ({
  approvals: initialApprovals,

  addApprovalRequest: (req) => set((s) => ({ approvals: [req, ...s.approvals] })),

  approveRequest: (id) => {
    const appr = get().approvals.find((a) => a.id === id);
    set((s) => ({
      approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: "approved" } : a)),
    }));

    if (appr) {
      const newRun: RunRecord = {
        id: "run-appr-" + Date.now(),
        user: "系统管理员 (Admin)",
        agentName: appr.agentName || "工单生成与审批 Agent",
        agentId: appr.agentId || "agent-ticket",
        taskSummary: `${appr.actionTitle} [人工审核批准]`,
        startTime: new Date().toLocaleTimeString(),
        durationMs: 420,
        status: "completed",
        tokensUsed: 620,
        costUsd: 0.0001,
        kbsUsed: [],
        toolsCalled: ["IPMS 现场维修工单创建接口"],
        childAgentsCalled: [],
        traceSteps: [
          {
            id: "s1",
            stepName: "用户手动审批批准 (Approval Accepted)",
            type: "approval",
            durationMs: 20,
            status: "success",
            detail: `审批单 ID: ${appr.id}，审批员角色与电子签名校验对齐`,
          },
          {
            id: "s2",
            stepName: "执行 tool-ticket-create 写接口 API",
            type: "tool",
            durationMs: 400,
            status: "success",
            detail: "写接口操作执行成功，已生成工单流水号 #IPMS-TICK-90812",
          },
        ],
      };

      if (get().addRun) {
        get().addRun(newRun);
      }
    }
  },

  rejectRequest: (id) => {
    set((s) => ({
      approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)),
    }));
  },
});
