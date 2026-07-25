import { StateCreator } from "zustand";
import { AgentDefinition, AgentVersion, CircuitBreakerConfig } from "../../types";
import { initialAgents } from "../../data/mockEnterpriseData";

export interface AgentSlice {
  agents: AgentDefinition[];
  currentAgentId: string;

  // Actions
  setCurrentAgentId: (id: string) => void;
  addAgent: (agent: AgentDefinition) => void;
  updateAgent: (agent: AgentDefinition) => void;
  deleteAgent: (id: string) => void;
  toggleAgentKnowledgeBase: (agentId: string, kbId: string) => void;
  toggleAgentTool: (agentId: string, toolId: string) => void;
  toggleAgentChildAgent: (agentId: string, childId: string) => void;
  updateAgentVersion: (agentId: string, newVersion: AgentVersion) => void;
  updateAgentCircuitBreaker: (agentId: string, config: CircuitBreakerConfig) => void;
}

export const createAgentSlice: StateCreator<AgentSlice, [], [], AgentSlice> = (set) => ({
  agents: initialAgents,
  currentAgentId: "agent-supervisor",

  setCurrentAgentId: (currentAgentId) => set({ currentAgentId }),

  addAgent: (agent) => set((s) => ({ agents: [agent, ...s.agents] })),

  updateAgent: (agent) => set((s) => ({
    agents: s.agents.map((a) => (a.id === agent.id ? agent : a)),
  })),

  deleteAgent: (id) => set((s) => ({
    agents: s.agents.filter((a) => a.id !== id),
  })),

  toggleAgentKnowledgeBase: (agentId, kbId) => set((s) => ({
    agents: s.agents.map((a) => {
      if (a.id !== agentId) return a;
      const exists = a.knowledgeBaseIds.includes(kbId);
      const newKbIds = exists
        ? a.knowledgeBaseIds.filter((id) => id !== kbId)
        : [...a.knowledgeBaseIds, kbId];
      return { ...a, knowledgeBaseIds: newKbIds };
    }),
  })),

  toggleAgentTool: (agentId, toolId) => set((s) => ({
    agents: s.agents.map((a) => {
      if (a.id !== agentId) return a;
      const exists = a.toolIds.includes(toolId);
      const newToolIds = exists
        ? a.toolIds.filter((id) => id !== toolId)
        : [...a.toolIds, toolId];
      return { ...a, toolIds: newToolIds };
    }),
  })),

  toggleAgentChildAgent: (agentId, childId) => set((s) => ({
    agents: s.agents.map((a) => {
      if (a.id !== agentId) return a;
      const exists = a.childAgentIds.includes(childId);
      const newChildIds = exists
        ? a.childAgentIds.filter((id) => id !== childId)
        : [...a.childAgentIds, childId];
      return { ...a, childAgentIds: newChildIds };
    }),
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
    }),
  })),

  updateAgentCircuitBreaker: (agentId, config) => set((s) => ({
    agents: s.agents.map((a) => (a.id === agentId ? { ...a, circuitBreaker: config } : a)),
  })),
});
