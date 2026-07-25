import { StateCreator } from "zustand";
import { BuiltInModule } from "../../types";
import { initialModules } from "../../data/mockEnterpriseData";

export interface ModuleSlice {
  modules: BuiltInModule[];
  addModule: (module: BuiltInModule) => void;
  updateModule: (id: string, updates: Partial<BuiltInModule>) => void;
  deleteModule: (id: string) => void;
}

export const createModuleSlice: StateCreator<ModuleSlice, [], [], ModuleSlice> = (set) => ({
  modules: initialModules,
  addModule: (newMod) =>
    set((state) => ({
      modules: [newMod, ...state.modules],
    })),
  updateModule: (id, updates) =>
    set((state) => ({
      modules: state.modules.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  deleteModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
    })),
});
