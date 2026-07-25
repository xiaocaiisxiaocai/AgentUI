import { StateCreator } from "zustand";
import { RunRecord } from "../../types";
import { initialRuns } from "../../data/mockEnterpriseData";

export interface RunSlice {
  runs: RunRecord[];

  // Actions
  addRun: (run: RunRecord) => void;
}

export const createRunSlice: StateCreator<RunSlice, [], [], RunSlice> = (set) => ({
  runs: initialRuns,

  addRun: (run) => set((s) => ({ runs: [run, ...s.runs] })),
});
