import React, { useState } from "react";
import {
  Database,
  FileText,
  Upload,
  Search,
  Sparkles,
  Building2,
  X,
  FileSpreadsheet,
  FileType,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Table,
  Layers,
  ArrowRight
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { RAGDocument, RAGChunk, KnowledgeSource } from "../types";
import { SyncJobsModal } from "../components/SyncJobsModal";
import { DocumentChunkViewerModal } from "../components/DocumentChunkViewerModal";

export const KnowledgePage: React.FC = () => {
  const {
    documents,
    chunks,
    knowledgeBases,
    knowledgeSources,
    addDocument,
    selectedDept,
    setSelectedDept
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"docs" | "kbs" | "sources" | "test">("docs");

  // Document Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState<"pdf" | "markdown" | "docx" | "xlsx">("pdf");
  const [docDept, setDocDept] = useState("售后技术部");
  // Excel Parsing Config
  const [sheetName, setSheetName] = useState("Sheet1");
  const [headerRow, setHeaderRow] = useState(1);
  // PDF Config
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [chunkSize, setChunkSize] = useState(500);

  // Selected Doc for Chunk Viewer Modal
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<RAGDocument | null>(null);

  // Selected Source for Sync & Field Mapping Modal
  const [selectedSourceForSync, setSelectedSourceForSync] = useState<KnowledgeSource | null>(null);
  const [showSyncModalGlobal, setShowSyncModalGlobal] = useState(false);

  // Advanced Retrieval Test State
  const [testQuery, setTestQuery] = useState("客户现场 PLC 通讯超时怎么排查？");
  const [searchStrategy, setSearchStrategy] = useState<"hybrid" | "vector" | "keyword">("hybrid");
  const [topK, setTopK] = useState(3);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [testResults, setTestResults] = useState<RAGChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const departments = ["全部试点部门", "售后技术部", "运营助理部", "通用行政部"];

  const filteredDocs = documents.filter((d) => {
    const matchesDept = selectedDept === "全部试点部门" || d.department === selectedDept;
    const matchesQuery =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const newDoc: RAGDocument = {
      id: "doc-" + Date.now(),
      title: docTitle.trim(),
      type: docType,
      size: "1.2 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      chunksCount: Math.floor(Math.random() * 20) + 10,
      status: "indexed",
      category: docType === "xlsx" ? "Excel 办公指南" : "现场问题排查",
      department: docDept,
    };

    addDocument(newDoc);
    setShowUploadModal(false);
    setDocTitle("");
  };

  const handleRunRetrievalTest = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setTestResults(chunks);
    }, 600);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Database className="w-6 h-6 text-blue-400" />
            <span>RAG 知识库与 4 级数据架构 (KnowledgeBase → Source → Document → Chunk)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            支持 IPMS 售后数据库字段映射、Excel/PDF 重叠切片与混合检索（Dense Vector + BM25 + Rerank）。
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowSyncModalGlobal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs shadow-xs transition-colors"
          >
            <Table className="w-4 h-4" />
            <span>IPMS / 数据库字段映射与同步</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>导入/解析新文档</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Department Isolation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-white/10 pb-2">
        <div className="flex items-center space-x-4 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab("docs")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "docs" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            已索引文档 ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("kbs")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "kbs" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            知识库集合 ({knowledgeBases.length})
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "sources" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            数据源与 IPMS 数据库 ({knowledgeSources.length})
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "test" ? "border-purple-500 text-purple-300" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            检索可验证测试 (Retrieval Test)
          </button>
        </div>

        {/* Department Pill Selector */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-slate-400 flex items-center space-x-1 mr-1">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>部门隔离:</span>
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDept === dept
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-white dark:bg-[#121215] text-slate-400 border border-neutral-200 dark:border-white/10"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Documents List */}
      {activeTab === "docs" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="按标题或分类过滤文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121215] text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-sm space-y-3 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      {doc.type === "xlsx" ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{doc.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {doc.department} | {doc.category}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                    {doc.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-neutral-100 dark:border-white/5">
                  <span>切片数: <strong className="text-slate-200">{doc.chunksCount} chunks</strong></span>
                  <span>大小: {doc.size}</span>
                  <button
                    onClick={() => setSelectedDocForViewer(doc)}
                    className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>查看与定位 Chunk</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Knowledge Bases */}
      {activeTab === "kbs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {knowledgeBases.map((kb) => (
            <div
              key={kb.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100">{kb.name}</h3>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold">
                  {kb.department}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{kb.description}</p>
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-neutral-900 rounded-lg text-center font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">文档</span>
                  <span className="font-bold text-slate-200">{kb.docCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">向量切片</span>
                  <span className="font-bold text-blue-400">{kb.chunkCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">绑定 Agent</span>
                  <span className="font-bold text-purple-400">{kb.usedByAgentsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Data Sources */}
      {activeTab === "sources" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {knowledgeSources.map((src) => (
            <div key={src.id} className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-400 font-mono">{src.type}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{src.status}</span>
              </div>
              <div className="font-bold text-sm text-slate-200">{src.name}</div>
              <div className="text-[10px] font-mono text-slate-400">
                同步频率: {src.syncMode} | 部门: {src.department}
              </div>

              <button
                onClick={() => {
                  setSelectedSourceForSync(src);
                  setShowSyncModalGlobal(true);
                }}
                className="w-full py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center space-x-1"
              >
                <Table className="w-3.5 h-3.5" />
                <span>映射与同步任务</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Advanced Retrieval Test */}
      {activeTab === "test" && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-4">
            <div className="font-bold text-sm text-purple-300 flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              <span>RAG 可验证性测试控制台 (Dense + Sparse BM25 + Rerank)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">检索策略 (Strategy)</label>
                <select
                  value={searchStrategy}
                  onChange={(e) => setSearchStrategy(e.target.value as any)}
                  className="w-full p-2 rounded border border-white/10 bg-neutral-900 text-slate-100"
                >
                  <option value="hybrid">混合检索 (Hybrid Dense Vector + Sparse BM25)</option>
                  <option value="vector">稠密向量检索 (Dense Vector Only)</option>
                  <option value="keyword">关键字检索 (BM25 Keyword Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Top-K 召回数量: {topK}</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">相似度得分阈值: {similarityThreshold}</label>
                <input
                  type="range"
                  min={0.5}
                  max={0.95}
                  step={0.05}
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                placeholder="输入测试查询 Query..."
              />
              <button
                onClick={handleRunRetrievalTest}
                disabled={isSearching}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? "animate-spin" : ""}`} />
                <span>运行召回测试</span>
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs font-mono text-slate-300">召回结果列表 ({testResults.length} Chunks)</h3>
              {testResults.map((chunk, idx) => (
                <div key={chunk.id} className="p-4 rounded-xl border border-white/10 bg-neutral-900 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      [{idx + 1}] {chunk.title}
                    </span>
                    <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      相似度得分: {chunk.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-black/50 p-2.5 rounded border border-white/5">
                    {chunk.content}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400">
                    来源: {chunk.docName} | 部门: {chunk.department}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200 dark:border-white/10 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">导入新知识文档</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">文档名称</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="例如: 售后技术部_2026设备操作指南.pdf"
                  className="w-full px-3 py-2 rounded border border-white/10 bg-neutral-900 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">文件类型</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded border border-white/10 bg-neutral-900 text-slate-100"
                  >
                    <option value="pdf">PDF 手册</option>
                    <option value="xlsx">Excel 工作簿 (.xlsx)</option>
                    <option value="docx">Word 文档 (.docx)</option>
                    <option value="markdown">Markdown (.md)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">归属隔离部门</label>
                  <select
                    value={docDept}
                    onChange={(e) => setDocDept(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-white/10 bg-neutral-900 text-slate-100"
                  >
                    <option value="售后技术部">售后技术部</option>
                    <option value="运营助理部">运营助理部</option>
                    <option value="通用行政部">通用行政部</option>
                  </select>
                </div>
              </div>

              {/* Excel Config */}
              {docType === "xlsx" && (
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <div className="font-bold text-emerald-300 flex items-center space-x-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel 表格高精切片解析参数</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <label className="block text-slate-400 text-[10px]">Sheet 名称</label>
                      <input
                        type="text"
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        className="w-full p-1.5 rounded bg-black border border-white/10 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px]">表头起始行</label>
                      <input
                        type="number"
                        value={headerRow}
                        onChange={(e) => setHeaderRow(Number(e.target.value))}
                        className="w-full p-1.5 rounded bg-black border border-white/10 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded border border-white/10 text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-md"
                >
                  开始向量化构建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Jobs & Field Mapping Modal */}
      {showSyncModalGlobal && (
        <SyncJobsModal
          source={selectedSourceForSync || undefined}
          onClose={() => {
            setShowSyncModalGlobal(false);
            setSelectedSourceForSync(null);
          }}
        />
      )}

      {/* Document Chunk Viewer Modal */}
      {selectedDocForViewer && (
        <DocumentChunkViewerModal
          document={selectedDocForViewer}
          onClose={() => setSelectedDocForViewer(null)}
        />
      )}
    </div>
  );
};
