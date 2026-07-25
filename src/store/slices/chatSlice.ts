import { StateCreator } from "zustand";
import { ChatMessage, ChatSession } from "../../types";
import { apiService } from "../../services/apiService";
import { UISlice } from "./uiSlice";
import { AgentSlice } from "./agentSlice";
import { RunSlice } from "./runSlice";

const STORAGE_KEY = "ai_studio_chat_sessions_v2";

const initialDefaultSession: ChatSession = {
  id: "session-default",
  title: "PLC 504 网关超时案例诊断与工单处理",
  createdAt: "2026-07-24 09:14:00",
  updatedAt: "2026-07-24 09:14:10",
  messageCount: 2,
  totalTokens: 1420,
  isPinned: true,
  tags: ["售后排查", "IPMS"],
  model: "Gemini 3.6 Flash",
  messages: [
    {
      id: "msg-1",
      sender: "user",
      text: "客户现场 PLC 通讯超时 504 Gateway Timeout 怎么排查？请查阅售后技术部历史案例并准备向 IPMS 提交维修单。",
      timestamp: "09:14:05",
    },
    {
      id: "msg-2",
      sender: "agent",
      text: "根据**售后技术部 IPMS 历史故障知识库** §3.2 召回结论：\n\n1. **控制箱 24V 供电核查**：首先测量现场终端 24V 开关电源，排查降压与线缆松动；\n2. **Ping 连通性测试**：执行 `ping 192.168.10.100` 确认局域网物理链路打通；\n3. **网关复位与凭证重导入**：若打通但报文丢失，复位交换机并重新导入通信秘钥凭证。\n\n已为您自动构造 IPMS 特急维修工单草稿，涉及写接口，需您在待办中心进行确认核准。",
      timestamp: "09:14:10",
      citations: [
        {
          id: "cite-101",
          docTitle: "售后技术部_客户现场常见故障排查与应急处置手册_v3.2.pdf",
          section: "§ 3.2 现场设备通讯中断与 504 Gateway Timeout 紧急修复规程",
          excerpt: "当客户现场终端出现 504 网关超时或 PLC 报文丢失时，复位交换机并重新导入凭证。",
          similarity: 0.96,
          page: 14,
          kbId: "kb-ipms-history",
          chunkId: "doc-101-c2",
        },
      ],
      steps: [
        { id: "s1", name: "意图解析 (Intent Parsing)", status: "completed", durationMs: 120, detail: "结合售后与工单意图" },
        { id: "s2", name: "IPMS 向量召回 (RAG)", status: "completed", durationMs: 380, detail: "匹配历史案例 §3.2" },
        { id: "s3", name: "工单卡片拦截 (Approval Required)", status: "waiting_approval", durationMs: 50, detail: "需要用户进行确认" },
      ],
    },
  ],
};

function loadStoredSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [initialDefaultSession];
}

function saveStoredSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    // ignore
  }
}

export interface ChatSlice {
  sessions: ChatSession[];
  activeSessionId: string;
  isGenerating: boolean;

  // Actions
  createSession: (title?: string) => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearCurrentSessionMessages: () => void;
  sendMessage: (queryText: string) => Promise<void>;
}

export const createChatSlice: StateCreator<
  ChatSlice & UISlice & AgentSlice & RunSlice,
  [],
  [],
  ChatSlice
> = (set, get) => {
  const loaded = loadStoredSessions();

  return {
    sessions: loaded,
    activeSessionId: loaded[0]?.id || "session-default",
    isGenerating: false,

    createSession: (title) => {
      const newSession: ChatSession = {
        id: "session-" + Date.now(),
        title: title || `新对话 session-${new Date().toLocaleTimeString().slice(0, 5)}`,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        messageCount: 0,
        totalTokens: 0,
        isPinned: false,
        tags: ["新建"],
        model: "Gemini 3.6 Flash",
        agentId: get().currentAgentId,
        messages: [],
      };

      const updated = [newSession, ...get().sessions];
      saveStoredSessions(updated);
      set({ sessions: updated, activeSessionId: newSession.id });
      return newSession.id;
    },

    switchSession: (id) => {
      const exists = get().sessions.find((s) => s.id === id);
      if (exists) {
        set({ activeSessionId: id });
        const lastAgentMsg = exists.messages.filter((m) => m.sender === "agent").pop();
        if (lastAgentMsg) {
          get().setActiveMessageId(lastAgentMsg.id);
        }
      }
    },

    deleteSession: (id) => {
      const filtered = get().sessions.filter((s) => s.id !== id);
      const remaining = filtered.length > 0 ? filtered : [initialDefaultSession];
      saveStoredSessions(remaining);
      set({
        sessions: remaining,
        activeSessionId: remaining[0].id,
      });
    },

    clearCurrentSessionMessages: () => {
      const { activeSessionId, sessions } = get();
      const updated = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [], messageCount: 0 } : s
      );
      saveStoredSessions(updated);
      set({ sessions: updated });
    },

    sendMessage: async (queryText) => {
      if (!queryText.trim() || get().isGenerating) return;

      const userMsg: ChatMessage = {
        id: "msg-" + Date.now(),
        sender: "user",
        text: queryText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };

      const activeSession = get().sessions.find((s) => s.id === get().activeSessionId);
      const curAgent = get().agents.find((a) => a.id === get().currentAgentId) || get().agents[0];

      // Update Session messages
      const updatedSessionsWithUser = get().sessions.map((s) => {
        if (s.id === get().activeSessionId) {
          return {
            ...s,
            updatedAt: new Date().toLocaleString(),
            messageCount: s.messages.length + 1,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      });

      set({ sessions: updatedSessionsWithUser, isGenerating: true });
      saveStoredSessions(updatedSessionsWithUser);

      try {
        const response = await apiService.sendMessage({
          message: queryText,
          agentId: curAgent.id,
          department: get().selectedDept,
          systemInstruction: curAgent.systemPrompt,
          model: curAgent.model || "gemini-3.6-flash",
        });

        // Strict validation: response.citations will be empty array if server didn't find citations
        const agentMsg: ChatMessage = {
          id: "msg-agent-" + Date.now(),
          sender: "agent",
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          citations: response.citations || [], // Strict rule: No fake fallback citations!
          steps: response.executionSteps || [],
          latencyMs: response.metrics?.latencyMs || 650,
          tokens: response.metrics?.completionTokens || 120,
          model: response.metrics?.model || curAgent.model,
          isAiGenerated: response.isAiGenerated,
        };

        const finalSessions = get().sessions.map((s) => {
          if (s.id === get().activeSessionId) {
            return {
              ...s,
              updatedAt: new Date().toLocaleString(),
              messageCount: s.messages.length + 1,
              messages: [...s.messages, agentMsg],
            };
          }
          return s;
        });

        saveStoredSessions(finalSessions);
        set({ sessions: finalSessions, isGenerating: false });
        // Set active message ID for Inspector panel
        get().setActiveMessageId(agentMsg.id);

        // Append a Run record to trace history
        if (get().addRun) {
          get().addRun({
            id: "run-" + Date.now(),
            user: "当前登录用户",
            agentName: curAgent.name,
            agentId: curAgent.id,
            taskSummary: queryText.slice(0, 40) + (queryText.length > 40 ? "..." : ""),
            startTime: new Date().toLocaleTimeString(),
            durationMs: response.metrics?.latencyMs || 650,
            status: "completed",
            tokensUsed: (response.metrics?.promptTokens || 50) + (response.metrics?.completionTokens || 120),
            costUsd: 0.0001,
            kbsUsed: curAgent.knowledgeBaseIds || [],
            toolsCalled: curAgent.toolIds || [],
            childAgentsCalled: curAgent.childAgentIds || [],
            traceSteps: (response.executionSteps || []).map((st, i) => ({
              id: st.id || `st-${i}`,
              stepName: st.name,
              type: "rag",
              durationMs: st.durationMs || 100,
              status: st.status === "completed" ? "success" : "failed",
              detail: st.detail || "",
            })),
          });
        }
      } catch (err: any) {
        // P0 Rule 3: Explicit error message, DO NOT fake a diagnostic answer!
        const errMsgText = `⚠️ 接口响应异常，未能完成实时检索与推理。\n错误原因：${err?.message || "网络断开或服务器处理超时"}`;

        const errorAgentMsg: ChatMessage = {
          id: "msg-err-" + Date.now(),
          sender: "agent",
          text: errMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          citations: [], // Strict rule: No citations on error!
          steps: [
            {
              id: "step-err-1",
              name: "系统接口请求失败 (Service Connection Error)",
              status: "failed",
              durationMs: 0,
              detail: err?.message || "API 响应异常",
            },
          ],
        };

        const finalSessionsWithError = get().sessions.map((s) => {
          if (s.id === get().activeSessionId) {
            return {
              ...s,
              updatedAt: new Date().toLocaleString(),
              messageCount: s.messages.length + 1,
              messages: [...s.messages, errorAgentMsg],
            };
          }
          return s;
        });

        saveStoredSessions(finalSessionsWithError);
        set({ sessions: finalSessionsWithError, isGenerating: false });
        get().setActiveMessageId(errorAgentMsg.id);
      }
    },
  };
};
