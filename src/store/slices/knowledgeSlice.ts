import { StateCreator } from "zustand";
import {
  KnowledgeBase,
  KnowledgeSource,
  SyncJob,
  RAGDocument,
  RAGChunk,
  FieldMapping,
} from "../../types";
import { initialKnowledgeBases, initialKnowledgeSources } from "../../data/mockEnterpriseData";
import { initialDocuments, initialChunks } from "../../data/mockKnowledge";

const initialSyncJobs: SyncJob[] = [
  {
    id: "job-101",
    sourceId: "source-ipms-db",
    sourceName: "IPMS 售后故障分析库",
    status: "completed",
    totalDocs: 1250,
    syncedDocs: 1250,
    failedDocs: 0,
    timestamp: "2026-07-24 09:30:00",
  },
  {
    id: "job-102",
    sourceId: "source-sql-server",
    sourceName: "SQL Server 设备主数据视图",
    status: "failed",
    totalDocs: 450,
    syncedDocs: 412,
    failedDocs: 38,
    errorMessage: "网络高延迟超时: 数据库连接在执行 Batch Chunking 时中断 [Socket Timeout]",
    timestamp: "2026-07-24 08:15:22",
  },
  {
    id: "job-103",
    sourceId: "source-sharepoint",
    sourceName: "SharePoint 研发工程规范库",
    status: "running",
    totalDocs: 800,
    syncedDocs: 540,
    failedDocs: 0,
    timestamp: "2026-07-24 10:02:11",
  },
];

export interface KnowledgeSlice {
  knowledgeBases: KnowledgeBase[];
  knowledgeSources: KnowledgeSource[];
  syncJobs: SyncJob[];
  documents: RAGDocument[];
  chunks: RAGChunk[];

  // Actions
  addDocument: (doc: RAGDocument) => void;
  addKnowledgeSource: (source: KnowledgeSource) => void;
  updateFieldMappings: (sourceId: string, mappings: FieldMapping[]) => void;
  triggerSyncJob: (sourceId: string) => void;
}

export const createKnowledgeSlice: StateCreator<KnowledgeSlice, [], [], KnowledgeSlice> = (set, get) => ({
  knowledgeBases: initialKnowledgeBases,
  knowledgeSources: initialKnowledgeSources,
  syncJobs: initialSyncJobs,
  documents: initialDocuments,
  chunks: initialChunks,

  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  addKnowledgeSource: (source) => set((s) => ({ knowledgeSources: [source, ...s.knowledgeSources] })),

  updateFieldMappings: (sourceId, mappings) => set((s) => ({
    knowledgeSources: s.knowledgeSources.map((src) =>
      src.id === sourceId ? { ...src, fieldMappings: mappings } : src
    ),
  })),

  triggerSyncJob: (sourceId) => {
    const src = get().knowledgeSources.find((s) => s.id === sourceId);
    const newJob: SyncJob = {
      id: "job-" + Date.now(),
      sourceId,
      sourceName: src?.name || "数据源",
      status: "running",
      totalDocs: 500,
      syncedDocs: 0,
      failedDocs: 0,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    set((s) => ({ syncJobs: [newJob, ...s.syncJobs] }));

    setTimeout(() => {
      set((s) => ({
        syncJobs: s.syncJobs.map((j) =>
          j.id === newJob.id ? { ...j, status: "completed", syncedDocs: 500 } : j
        ),
      }));
    }, 1800);
  },
});
