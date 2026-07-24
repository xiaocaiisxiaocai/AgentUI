import React, { useState } from "react";
import {
  Database,
  Upload,
  Search,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  SlidersHorizontal,
  Building2,
  ShieldCheck,
  PlusCircle,
  FolderLock,
  X,
  Info,
} from "lucide-react";
import { RAGDocument, RAGChunk, AppLanguage } from "../types";
import { t } from "../i18n/translations";

interface RAGViewProps {
  documents: RAGDocument[];
  chunks: RAGChunk[];
  onUploadDocument: (doc: RAGDocument) => void;
  onDeleteDocument: (id: string) => void;
  lang: AppLanguage;
}

export const RAGView: React.FC<RAGViewProps> = ({
  documents,
  chunks,
  onUploadDocument,
  onDeleteDocument,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RAGChunk[]>(chunks);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [deptList, setDeptList] = useState<string[]>([
    "售后技术部",
    "运营助理部",
    "通用行政部",
    "财务部 (预留)",
    "人力资源部 (预留)",
  ]);

  // Handle live semantic search test
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(chunks);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch("/api/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.warn("Search API failed, filtering locally:", err);
      const filtered = chunks.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.content.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  // Upload simulation
  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const targetDept = selectedDept !== "All" && !selectedDept.includes("预留") ? selectedDept : "售后技术部";
    const newDoc: RAGDocument = {
      id: "doc-" + Date.now(),
      title: file.name,
      type: file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".md") ? "markdown" : "txt",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadDate: new Date().toISOString().slice(0, 10),
      chunksCount: Math.floor(Math.random() * 20) + 10,
      status: "indexed",
      category: "上传归档",
      department: targetDept,
    };
    onUploadDocument(newDoc);
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setDeptList([...deptList, `${newDeptName.trim()} (新预留)`]);
    setNewDeptName("");
    setShowAddDeptModal(false);
  };

  const filteredDocs = selectedDept === "All"
    ? documents
    : documents.filter((d) => d.department === selectedDept || (d.department && selectedDept.includes(d.department)));

  const filteredChunks = selectedDept === "All"
    ? searchResults
    : searchResults.filter((c) => c.department === selectedDept || (c.department && selectedDept.includes(c.department)));

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
            <Database className="w-6 h-6 text-blue-400" />
            <span>企业部门隔离 RAG 知识库管理</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            试点阶段：支持【售后技术部】现场历史资料与【运营助理部】Excel 操作指南维护；支持预留扩展其他部门独立知识库。
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs shadow-xs transition-colors"
          >
            <FolderLock className="w-4 h-4" />
            <span>预留新增部门知识库</span>
          </button>

          {/* Upload Trigger Button */}
          <label className="flex items-center justify-center space-x-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-transform hover:scale-105">
            <Upload className="w-4 h-4" />
            <span>{t("uploadDoc", lang)}</span>
            <input type="file" onChange={handleFileDrop} className="hidden" />
          </label>
        </div>
      </div>

      {/* DEPARTMENT ISOLATION ARCHITECTURE RESERVATION BANNER */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 flex items-start space-x-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-400 mr-1.5">多部门隔离与权限预留机制已启用：</span>
          各部门可通过专属 Namespace/Collection 独立维护历史资料与知识切片（如售后现场处置、助理Excel指南），检索时按部门过滤上下文，确保数据隐私隔离与毫秒级精准召回。
        </div>
      </div>

      {/* SECTION 1: Document Repository Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-neutral-800 dark:text-slate-200 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>已归档知识库文档 ({filteredDocs.length})</span>
          </h2>

          {/* Department Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono py-1">
            <span className="text-slate-400 text-[11px] font-sans mr-1 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1" /> 部门筛选:
            </span>
            <button
              onClick={() => setSelectedDept("All")}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedDept === "All"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              全部部门 ({documents.length})
            </button>
            {deptList.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedDept === dept
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-neutral-50 dark:bg-[#151515] text-slate-400 font-mono text-[10px] uppercase border-b border-neutral-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">{t("docName", lang)}</th>
                <th className="py-3 px-4">所属部门</th>
                <th className="py-3 px-4">文档分类</th>
                <th className="py-3 px-4">大小</th>
                <th className="py-3 px-4">{t("chunkCount", lang)}</th>
                <th className="py-3 px-4">{t("uploadDate", lang)}</th>
                <th className="py-3 px-4">状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5 text-neutral-700 dark:text-slate-300">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-semibold flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate max-w-xs">{doc.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20 font-bold">
                      {doc.department || "未指定"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-xs font-mono border border-white/5">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{doc.size}</td>
                  <td className="py-3 px-4 font-mono">{doc.chunksCount} chunks</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">{doc.uploadDate}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t("statusIndexed", lang)}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                      title="删除文档"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Interactive Semantic Search Test Playground */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-white/10">
        <div>
          <h2 className="text-sm font-bold text-neutral-800 dark:text-slate-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>跨部门向量近邻检索 (ANN) 召回验证</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">
            在下方输入故障现象、错误代码或 Excel 操作需求（如“PLC通讯超时”、“XLOOKUP公式”），测试向量召回匹配度。
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="输入如：504超时 / PLC报文 / Excel动态数组 / 差旅补贴..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] text-xs sm:text-sm text-neutral-800 dark:text-slate-100 shadow-sm focus:outline-none focus:border-blue-500/50"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-3.5 text-xs text-blue-400 font-mono animate-pulse">
              匹配向量库近邻分块中...
            </div>
          )}
        </div>

        {/* Matched Chunks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChunks.map((chunk) => (
            <div
              key={chunk.id}
              className="p-4 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-sm space-y-2 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 dark:text-slate-200 truncate pr-2">
                  {chunk.title}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  {(chunk.score * 100).toFixed(1)}% {t("semanticScore", lang)}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                  {chunk.department || "未分类"}
                </span>
                <span className="truncate">来自: {chunk.docName}</span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-slate-300 leading-relaxed bg-neutral-50 dark:bg-[#151515] p-3 rounded border border-neutral-100 dark:border-white/5">
                "{chunk.content}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for reserving a new department knowledge base */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121215] rounded-xl border border-neutral-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <FolderLock className="w-4 h-4 text-blue-400" />
                <span>预留扩展新部门 RAG 知识库</span>
              </h3>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              为后续新增的部门（如财务部、HR部门、销售部）预留独立向量数据库隔离空间。新部门主管后续可独立维护该部门的历史档案。
            </p>

            <form onSubmit={handleCreateDept} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  部门名称 / 知识库别名
                </label>
                <input
                  type="text"
                  placeholder="例如：财务部 / 销售二部"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#050505] text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>预留创建后，系统将自动划分 vector_collection_namespace 规则。</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-3 py-1.5 rounded border border-white/10 text-xs text-slate-300 hover:bg-white/5"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold shadow-xs"
                >
                  确认新增预留部门
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

