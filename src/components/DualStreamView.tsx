import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Zap,
  Clock,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  Copy,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Code2,
  BookOpen,
  Info,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { ChatMessage, ExecutionStep, Citation, AppLanguage, PromptTemplate } from "../types";
import { t } from "../i18n/translations";

interface DualStreamViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachments: any[], enableRAG: boolean, selectedPlugins: string[]) => void;
  isGenerating: boolean;
  activeExecutionSteps: ExecutionStep[];
  citations: Citation[];
  enableRAG: boolean;
  setEnableRAG: (enable: boolean) => void;
  lang: AppLanguage;
  promptTemplates: PromptTemplate[];
  availablePlugins: string[];
  selectedPlugins: string[];
  setSelectedPlugins: (plugins: string[]) => void;
  onClearHistory: () => void;
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[\s\S]*?\*\*|`[^`]+`|\[Source:[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-neutral-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px] border border-blue-500/20">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("[Source:") && part.endsWith("]")) {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] border border-blue-500/30 my-0.5">
          📄 {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

const FormattedMessage: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans">{content}</div>;
  }

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 font-sans text-xs sm:text-sm leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const lang = lines[0].trim().match(/^[a-zA-Z0-9_-]+$/) ? lines[0].trim() : "";
          const codeText = lang ? lines.slice(1).join("\n") : lines.join("\n");

          const handleCopyCode = () => {
            navigator.clipboard.writeText(codeText);
            setCopiedCodeIdx(idx);
            setTimeout(() => setCopiedCodeIdx(null), 2000);
          };

          return (
            <div key={idx} className="my-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-900 dark:bg-[#050505] text-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-3 py-1 bg-neutral-800 dark:bg-[#111114] border-b border-neutral-700 dark:border-white/5 text-[10px] font-mono text-slate-400">
                <span className="uppercase text-blue-400 font-bold">{lang || "CODE"}</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 font-mono text-xs overflow-x-auto text-emerald-300/90 leading-relaxed scrollbar-none">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        const paragraphs = part.split("\n\n");
        return (
          <div key={idx} className="space-y-2">
            {paragraphs.map((para, pIdx) => {
              if (!para.trim()) return null;

              const lines = para.split("\n");
              const isList = lines.length > 1 && lines.every((l) => /^\s*([*•-]|\d+\.)\s+/.test(l));

              if (isList) {
                return (
                  <ul key={pIdx} className="space-y-1 pl-1 my-1">
                    {lines.map((line, lIdx) => {
                      const cleanLine = line.replace(/^\s*([*•-]|\d+\.)\s+/, "");
                      return (
                        <li key={lIdx} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                          <span>{renderInlineMarkdown(cleanLine)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="leading-relaxed">
                  {renderInlineMarkdown(para)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const DualStreamView: React.FC<DualStreamViewProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  activeExecutionSteps,
  citations,
  enableRAG,
  setEnableRAG,
  lang,
  promptTemplates,
  availablePlugins,
  selectedPlugins,
  setSelectedPlugins,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, activeExecutionSteps]);

  // Estimated Latency & Token Calculation
  const estLatencyMs = Math.round(450 + inputText.length * 2.5 + (enableRAG ? 350 : 0));
  const estTokens = Math.round(inputText.length * 1.5 + (enableRAG ? 400 : 0));

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(inputText, attachments, enableRAG, selectedPlugins);
    setInputText("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image / File Upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const isImage = file.type.startsWith("image/");
    const newAttach = {
      id: "att-" + Date.now(),
      name: file.name,
      type: isImage ? "image" : "file",
      url: URL.createObjectURL(file),
      size: `${(file.size / 1024).toFixed(1)} KB`,
    };
    setAttachments([...attachments, newAttach]);
  };

  // Voice recording simulation
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setInputText((prev) => prev + " [实时语音转译: 请基于 RAG 文档库总结双流架构性能]");
    } else {
      setIsRecording(true);
    }
  };

  // Copy text handler
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text To Speech handler
  const handleTTS = async (id: string, text: string) => {
    if (playingAudioId === id) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(id);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.onended = () => setPlayingAudioId(null);
        audio.play();
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
        utterance.lang = lang === "zh" ? "zh-CN" : "en-US";
        utterance.onend = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn("TTS Error, using Web Speech API fallback:", err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
        utterance.onend = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingAudioId(null);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-neutral-100 dark:bg-[#050505]">
      {/* LEFT STREAM: Conversation Stream (对话流) */}
      <div className="flex-1 flex flex-col h-full border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-[#080808] overflow-hidden">
        {/* Stream Bar Header */}
        <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-[#0d0d0d]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-xs sm:text-sm text-neutral-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              {t("chatStream", lang)}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-white/5 text-slate-400 border border-white/10">
              GEMINI 3.6 FLASH
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            {/* RAG Toggle */}
            <button
              onClick={() => setEnableRAG(!enableRAG)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
                enableRAG
                  ? "bg-blue-500/10 text-blue-300 border border-blue-500/30 font-medium"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>{t("ragToggle", lang)}</span>
            </button>

            {/* Clear History */}
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent hover:border-white/10"
              title={t("clearHistory", lang)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Plugin Bar Quick Toggles */}
        <div className="px-4 py-1.5 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/30 dark:bg-[#0a0a0a] flex items-center space-x-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-500 uppercase font-semibold text-[10px]">PLUGINS:</span>
          {availablePlugins.map((plugin) => {
            const isSelected = selectedPlugins.includes(plugin);
            return (
              <button
                key={plugin}
                onClick={() => {
                  if (isSelected) {
                    setSelectedPlugins(selectedPlugins.filter((p) => p !== plugin));
                  } else {
                    setSelectedPlugins([...selectedPlugins, plugin]);
                  }
                }}
                className={`px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30 font-medium"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                }`}
              >
                {isSelected ? "✓ " : "+ "}{plugin}
              </button>
            );
          })}
        </div>

        {/* Message Feed Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mb-3 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-base mb-1">
                欢迎使用 Agent 智能控制台
              </h3>
              <p className="text-xs max-w-md text-neutral-500 mb-6">
                支持双流交互、RAG 向量复杂文档检索、实时出处引用溯源及可视化工作流。
              </p>

              {/* Preset prompt launcher pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg text-left">
                {promptTemplates.slice(0, 4).map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setInputText(tpl.promptText)}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-xs"
                  >
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                      {tpl.title}
                    </div>
                    <div className="text-[11px] text-neutral-500 line-clamp-2">
                      {tpl.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center text-white shrink-0 shadow-sm ${
                    isUser
                      ? "bg-blue-600"
                      : "bg-[#151515] border border-white/10 text-blue-400"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble Content */}
                <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3.5 rounded text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-slate-200 rounded-tl-none"
                    }`}
                  >
                    {/* Attachments preview */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center space-x-1.5 p-1.5 rounded bg-black/10 dark:bg-white/5 border border-white/10 text-[11px] font-mono"
                          >
                            {att.type === "image" ? (
                              <ImageIcon className="w-3.5 h-3.5" />
                            ) : (
                              <FileText className="w-3.5 h-3.5" />
                            )}
                            <span className="truncate max-w-[120px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <FormattedMessage content={msg.text} isUser={isUser} />

                    {/* Citations / Source Attributions Display */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-white/10 space-y-1.5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>{t("sourceCitations", lang)} ({msg.citations.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {msg.citations.map((cite) => (
                            <button
                              key={cite.id}
                              onClick={() => setSelectedCitation(cite)}
                              className="text-left p-1.5 rounded bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 transition-colors flex items-center justify-between text-[11px]"
                            >
                              <div className="truncate pr-2 font-medium text-blue-300">
                                📄 {cite.docTitle} ({cite.section})
                              </div>
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 font-mono">
                                {(cite.similarity * 100).toFixed(0)}% Match
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Meta Actions */}
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 px-1">
                    <span>{msg.timestamp}</span>
                    {msg.latencyMs && (
                      <span className="flex items-center space-x-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{msg.latencyMs}ms</span>
                      </span>
                    )}
                    {msg.tokens && (
                      <span>{msg.tokens} Tokens</span>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 hover:text-slate-200 rounded"
                        title={t("copyText", lang)}
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => handleTTS(msg.id, msg.text)}
                          className={`p-1 rounded transition-colors ${
                            playingAudioId === msg.id
                              ? "text-blue-400 animate-pulse font-bold"
                              : "hover:text-slate-200"
                          }`}
                          title={t("playTTS", lang)}
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Live Generating Skeleton / Typing State */}
          {isGenerating && (
            <div className="flex space-x-3">
              <div className="w-7 h-7 rounded bg-[#151515] border border-white/10 flex items-center justify-center text-blue-400 shrink-0 shadow-sm animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3.5 rounded bg-white dark:bg-[#151515] border border-neutral-200 dark:border-white/10 rounded-tl-none space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-blue-400 font-mono text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Agent pipeline reasoning & synthesizing markdown output...</span>
                </div>
                <div className="h-1.5 bg-neutral-200 dark:bg-white/10 rounded w-48 animate-pulse" />
                <div className="h-1.5 bg-neutral-200 dark:bg-white/10 rounded w-32 animate-pulse" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar Section */}
        <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-[#0a0a0a] space-y-2">
          {/* Attachments preview row */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 font-mono"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-medium">{att.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                    className="ml-1 text-blue-400 hover:text-blue-200 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Prompt Templates Dropdown */}
          {showPromptPicker && (
            <div className="p-3 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#151515] shadow-xl space-y-2 max-h-48 overflow-y-auto">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>PROMPT TEMPLATES</span>
                <button
                  onClick={() => setShowPromptPicker(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  CLOSE
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {promptTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setInputText(tpl.promptText);
                      setShowPromptPicker(false);
                    }}
                    className="p-2 rounded text-left bg-white/5 hover:bg-white/10 border border-white/5 text-xs transition-colors"
                  >
                    <div className="font-medium text-slate-200">
                      {tpl.title}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {tpl.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Textarea Bar */}
          <div className="relative flex items-end rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#151515] shadow-sm focus-within:border-blue-500/50 transition-all p-2">
            <textarea
              rows={2}
              placeholder={t("placeholderInput", lang)}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none border-none bg-transparent text-xs sm:text-sm text-neutral-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none p-1 scrollbar-none"
            />

            <div className="flex items-center space-x-1 shrink-0 ml-2">
              {/* File Attachment */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                title="上传图片或文件"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Prompt Picker Button */}
              <button
                onClick={() => setShowPromptPicker(!showPromptPicker)}
                className="p-1.5 rounded text-slate-400 hover:text-purple-400 hover:bg-white/10 transition-colors"
                title="选择提示词模板"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </button>

              {/* Voice Input */}
              <button
                onClick={toggleRecording}
                className={`p-1.5 rounded transition-colors ${
                  isRecording
                    ? "bg-rose-500 text-white animate-pulse"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
                }`}
                title="语音录音输入"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={(!inputText.trim() && attachments.length === 0) || isGenerating}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold font-mono transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Telemetry Indicator Row */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>LATENCY: ~{estLatencyMs}ms</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-blue-400" />
                <span>TOKENS: ~{estTokens}</span>
              </span>
            </div>
            <span>Shift+Enter for newline</span>
          </div>
        </div>
      </div>

      {/* RIGHT STREAM: Agent Execution Trace Stream (执行流) */}
      <div className="w-full lg:w-80 flex flex-col h-full bg-neutral-50 dark:bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-white/10 overflow-hidden">
        {/* Execution Stream Header */}
        <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-[#0d0d0d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-xs text-neutral-800 dark:text-slate-200 uppercase font-mono tracking-wider">
              {t("executionStream", lang)}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium uppercase">
            LIVE TRACE
          </span>
        </div>

        {/* Execution Pipeline Steps Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 mb-2 flex items-center justify-between">
            <span>{t("thinkingProcess", lang)}</span>
            <span>{activeExecutionSteps.length} STEPS LOGGED</span>
          </div>

          {activeExecutionSteps.map((step, idx) => {
            const isExpanded = expandedTraceId === step.id;
            return (
              <div
                key={step.id}
                className="p-2.5 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#151515] shadow-sm transition-all hover:border-white/20"
              >
                {/* Step Top Row */}
                <div
                  onClick={() => setExpandedTraceId(isExpanded ? null : step.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-medium text-neutral-800 dark:text-slate-200">
                      {step.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                      {step.durationMs}ms
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Short Detail */}
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {step.detail}
                </p>

                {/* Gantt Bar Simulation */}
                <div className="w-full bg-white/5 h-1 rounded mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded transition-all duration-500"
                    style={{ width: `${Math.min(100, (step.durationMs / 300) * 100)}%` }}
                  />
                </div>

                {/* Expanded Raw Payload Inspector */}
                {isExpanded && (
                  <div className="mt-3 pt-2 border-t border-white/5 text-[11px] space-y-2">
                    {step.chunks && step.chunks.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">MATCHED CHUNKS:</span>
                        {step.chunks.map((c) => (
                          <div
                            key={c.id}
                            className="p-1.5 rounded bg-[#050505] border border-white/5 text-[10px]"
                          >
                            <div className="font-medium text-slate-300">
                              {c.docTitle}
                            </div>
                            <div className="text-slate-500 line-clamp-2 mt-0.5">
                              "{c.excerpt}"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">STEP PAYLOAD:</span>
                      <pre className="p-2 rounded bg-[#050505] text-emerald-400 font-mono text-[10px] overflow-x-auto mt-1 border border-white/5">
                        {JSON.stringify({ step: step.name, durationMs: step.durationMs, status: step.status }, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Citation Full Preview Popover */}
        {selectedCitation && (
          <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-[#151515] text-xs space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-blue-300">
              <span className="font-bold">CITATION - {selectedCitation.docTitle}</span>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              SECTION: {selectedCitation.section} | PAGE: p.{selectedCitation.page || 1}
            </div>
            <div className="p-2 rounded bg-[#050505] border border-white/10 text-slate-300 leading-relaxed max-h-32 overflow-y-auto text-[11px]">
              "{selectedCitation.excerpt}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
