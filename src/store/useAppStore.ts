import { create } from "zustand";
import { UISlice, createUISlice } from "./slices/uiSlice";
import { ChatSlice, createChatSlice } from "./slices/chatSlice";
import { AgentSlice, createAgentSlice } from "./slices/agentSlice";
import { KnowledgeSlice, createKnowledgeSlice } from "./slices/knowledgeSlice";
import { ToolSlice, createToolSlice } from "./slices/toolSlice";
import { WorkflowSlice, createWorkflowSlice } from "./slices/workflowSlice";
import { RunSlice, createRunSlice } from "./slices/runSlice";
import { ApprovalSlice, createApprovalSlice } from "./slices/approvalSlice";
import { RbacSlice, createRbacSlice } from "./slices/rbacSlice";

export type AppStore = UISlice &
  ChatSlice &
  AgentSlice &
  KnowledgeSlice &
  ToolSlice &
  WorkflowSlice &
  RunSlice &
  ApprovalSlice &
  RbacSlice;

export const useAppStore = create<AppStore>()((...a) => ({
  ...createUISlice(...a),
  ...createAgentSlice(...a),
  ...createKnowledgeSlice(...a),
  ...createToolSlice(...a),
  ...createWorkflowSlice(...a),
  ...createRunSlice(...a),
  ...createApprovalSlice(...a),
  ...createRbacSlice(...a),
  ...createChatSlice(...a),
}));
