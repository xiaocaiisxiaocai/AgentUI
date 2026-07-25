import { StateCreator } from "zustand";
import { ToolDefinition, ConnectorDefinition } from "../../types";
import { initialTools, initialConnectors } from "../../data/mockEnterpriseData";

export interface ToolSlice {
  tools: ToolDefinition[];
  connectors: ConnectorDefinition[];

  // Actions
  addTool: (tool: ToolDefinition) => void;
  updateTool: (tool: ToolDefinition) => void;
  addConnector: (connector: ConnectorDefinition) => void;
  updateConnector: (connector: ConnectorDefinition) => void;
}

export const createToolSlice: StateCreator<ToolSlice, [], [], ToolSlice> = (set) => ({
  tools: initialTools,
  connectors: initialConnectors,

  addTool: (tool) => set((s) => ({ tools: [tool, ...s.tools] })),
  updateTool: (tool) => set((s) => ({
    tools: s.tools.map((t) => (t.id === tool.id ? tool : t)),
  })),

  addConnector: (connector) => set((s) => ({ connectors: [connector, ...s.connectors] })),
  updateConnector: (connector) => set((s) => ({
    connectors: s.connectors.map((c) => (c.id === connector.id ? connector : c)),
  })),
});
