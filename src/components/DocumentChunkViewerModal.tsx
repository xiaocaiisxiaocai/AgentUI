import React, { useState } from "react";
import {
  X,
  FileText,
  Search,
  Database,
  Copy,
  Check,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { RAGDocument, RAGChunk } from "../types";

interface DocumentChunkViewerModalProps {
  document: RAGDocument;
  onClose: () => void;
}

export const DocumentChunkViewerModal: React.FC<DocumentChunkViewerModalProps> = ({ document, onClose }) => {
  const { chunks } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChunk, setSelectedChunk] = useState<RAGChunk | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const docChunks = chunks.filter((c) => c.docId === document.id || c.docName === document.title);

  const filteredChunks = docChunks.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyChunk = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-2xl overflow-hidden flex flex-col h-[680px]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#111115]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>{document.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {document.type.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                大小: {document.size} | 部门: {document.department} | 累计切片: {document.chunksCount} 个
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Split List & Chunk Detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Chunk List */}
          <div className="w-80 border-r border-white/10 bg-neutral-900/60 flex flex-col h-full">
            {/* Search Box */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索切片关健字..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Chunks Navigation */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
              {filteredChunks.length === 0 ? (
                <p className="text-slate-500 text-center py-6 font-mono text-[11px]">未搜索到匹配切片</p>
              ) : (
                filteredChunks.map((chunk, idx) => (
                  <button
                    key={chunk.id || idx}
                    onClick={() => setSelectedChunk(chunk)}
                    className={`w-full p-3 rounded-xl border text-left transition-all space-y-1 ${
                      selectedChunk?.id === chunk.id
                        ? "border-blue-500 bg-blue-500/10 font-bold text-blue-300"
                        : "border-white/5 bg-neutral-950 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="truncate max-w-[170px] text-slate-200">#{idx + 1} {chunk.title}</span>
                      <span className="text-emerald-400 font-bold">{(chunk.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{chunk.content}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Selected Chunk Detail Inspector */}
          <div className="flex-1 p-6 overflow-y-auto bg-neutral-950 flex flex-col justify-between space-y-4">
            {selectedChunk ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{selectedChunk.title}</h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Chunk ID: {selectedChunk.id} | Page: {selectedChunk.page || 1}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyChunk(selectedChunk.content, selectedChunk.id)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 font-mono text-xs flex items-center space-x-1"
                  >
                    {copiedId === selectedChunk.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === selectedChunk.id ? "已复制切片" : "复制切片文本"}</span>
                  </button>
                </div>

                {/* Score Breakdown (BM25 + Vector + Rerank) */}
                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-3 rounded-xl border border-white/10 bg-neutral-900">
                    <span className="text-[10px] text-slate-400 block">Vector Cosine 向量值</span>
                    <span className="text-sm font-bold text-blue-400">{(selectedChunk.vectorScore || 0.92).toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl border border-white/10 bg-neutral-900">
                    <span className="text-[10px] text-slate-400 block">BM25 词频可打分值</span>
                    <span className="text-sm font-bold text-amber-400">{(selectedChunk.bm25Score || 0.88).toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl border border-white/10 bg-neutral-900">
                    <span className="text-[10px] text-slate-400 block">Rerank 综合相关度</span>
                    <span className="text-sm font-bold text-emerald-400">{(selectedChunk.score * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-bold font-mono">切片文本原文 (Highlight Location)</label>
                  <div className="p-4 rounded-xl border border-white/10 bg-black text-slate-200 leading-relaxed font-sans text-sm whitespace-pre-wrap select-text">
                    {selectedChunk.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600" />
                <p>请在左侧列表中点击选择要预览和定位的切片 (Chunk)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
