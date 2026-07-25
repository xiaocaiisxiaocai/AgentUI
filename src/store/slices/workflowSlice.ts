import { StateCreator } from "zustand";
import { Workflow } from "../../types";
import { initialWorkflows } from "../../data/mockKnowledge";

export interface WorkflowSlice {
  workflows: Workflow[];
  activeWorkflowId: string | null;

  // Actions
  setActiveWorkflowId: (id: string | null) => void;
  addWorkflow: (wf: Workflow) => void;
  updateWorkflow: (wf: Workflow) => void;
}

export const createWorkflowSlice: StateCreator<WorkflowSlice, [], [], WorkflowSlice> = (set) => ({
  workflows: initialWorkflows,
  activeWorkflowId: "wf-1",

  setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),
  addWorkflow: (wf) => set((s) => ({ workflows: [wf, ...s.workflows] })),
  updateWorkflow: (wf) => set((s) => ({
    workflows: s.workflows.map((w) => (w.id === wf.id ? wf : w)),
  })),
});
