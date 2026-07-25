import { StateCreator } from "zustand";
import { AppLanguage, AppTheme, ViewMode, UserRole, AppEnvironment, Citation, FontSize, SpacingMode } from "../../types";

export interface UISlice {
  lang: AppLanguage;
  theme: AppTheme;
  viewMode: ViewMode;
  userRole: UserRole;
  environment: AppEnvironment;
  selectedDept: string;
  fontSize: FontSize;
  spacingMode: SpacingMode;

  // Inspector State
  isInspectorOpen: boolean;
  inspectorTab: "context" | "sources" | "agents" | "tools" | "trace" | "topology";
  activeMessageId: string | null;
  selectedCitation: Citation | null;

  // Actions
  setLang: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setViewMode: (mode: ViewMode) => void;
  setUserRole: (role: UserRole) => void;
  setEnvironment: (env: AppEnvironment) => void;
  setSelectedDept: (dept: string) => void;
  setFontSize: (size: FontSize) => void;
  setSpacingMode: (mode: SpacingMode) => void;

  toggleInspector: () => void;
  setIsInspectorOpen: (open: boolean) => void;
  setInspectorTab: (tab: "context" | "sources" | "agents" | "tools" | "trace" | "topology") => void;
  setActiveMessageId: (id: string | null) => void;
  setSelectedCitation: (citation: Citation | null) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  lang: "zh",
  theme: "dark",
  viewMode: "business",
  userRole: "admin",
  environment: "staging",
  selectedDept: "全部试点部门",
  fontSize: "large",
  spacingMode: "comfortable",

  isInspectorOpen: false,
  inspectorTab: "context",
  activeMessageId: "msg-2",
  selectedCitation: null,

  setLang: (lang) => set({ lang }),
  setTheme: (theme) => {
    set({ theme });
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
  setViewMode: (viewMode) => set({ viewMode }),
  setUserRole: (userRole) => set({ userRole }),
  setEnvironment: (environment) => set({ environment }),
  setSelectedDept: (selectedDept) => set({ selectedDept }),
  setFontSize: (fontSize) => set({ fontSize }),
  setSpacingMode: (spacingMode) => set({ spacingMode }),

  toggleInspector: () => set((s) => ({ isInspectorOpen: !s.isInspectorOpen })),
  setIsInspectorOpen: (isInspectorOpen) => set({ isInspectorOpen }),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
  setActiveMessageId: (activeMessageId) => set({ activeMessageId }),
  setSelectedCitation: (selectedCitation) => set({ selectedCitation }),
});
