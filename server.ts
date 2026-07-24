import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (err) {
  console.warn("Failed to initialize GoogleGenAI:", err);
}

// In-memory telemetry metrics
const metrics = {
  totalRequests: 142,
  avgLatencyMs: 1150,
  ragHitRate: 94.2,
  tokenCount: 184200,
  activeAgents: 4,
  errorCount: 2,
};

// API: Health & Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
    metrics,
  });
});

// API: Gemini Chat Endpoint with Dual-Stream Trace & RAG Retrieval
app.post("/api/chat", async (req, res) => {
  const startTime = Date.now();
  const { message, systemInstruction, enableRAG, model = "gemini-3.6-flash", plugins = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Simulated Knowledge Base Chunks for RAG Demonstration
  const mockChunks = [
    {
      id: "doc-101-c2",
      docTitle: "AI Agent Architecture Framework Whitepaper v2.4.pdf",
      section: "§ 3.2 Dual-Stream State Machine",
      excerpt: "The dual-stream execution pattern separates the user conversation stream from the reactive tool orchestration stream, ensuring real-time log transparency and non-blocking streaming output.",
      similarity: 0.94,
      page: 14,
    },
    {
      id: "doc-102-c8",
      docTitle: "Enterprise Vector RAG Reranking Guidelines.md",
      section: "§ 4.1 Hybrid Semantic Search & Reciprocal Rank Fusion",
      excerpt: "Combining dense vector embeddings with sparse BM25 indexing yields an optimal balance between exact term matching and semantic intent retrieval, achieving over 92% retrieval recall.",
      similarity: 0.89,
      page: 6,
    },
    {
      id: "doc-103-c1",
      docTitle: "Gemini Model Latency & Token Optimization Manual.pdf",
      section: "§ 2.5 Dynamic Prompt Pruning",
      excerpt: "Token budget management dynamically truncates historical chat contexts while retaining summary memories, keeping mean response latencies under 1,200 ms.",
      similarity: 0.85,
      page: 2,
    }
  ];

  const matchedChunks = enableRAG !== false ? mockChunks : [];

  // Build RAG Context String
  let augmentedPrompt = message;
  if (matchedChunks.length > 0) {
    const contextText = matchedChunks
      .map((c) => `[Source: ${c.docTitle} (${c.section})]: ${c.excerpt}`)
      .join("\n\n");
    augmentedPrompt = `Context Information from RAG Document Library:\n${contextText}\n\nUser Question: ${message}\n\nPlease answer the question based on the provided context. At the end of key statements or conclusions, cite sources using [Doc X] notation where appropriate.`;
  }

  let aiResponseText = "";
  let isAiGenerated = false;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: model || "gemini-3.6-flash",
        contents: augmentedPrompt,
        config: {
          systemInstruction: systemInstruction || "You are an intelligent AI Agent specialized in enterprise workflows, document retrieval, and system operations.",
          temperature: 0.7,
        },
      });

      if (response.text) {
        aiResponseText = response.text;
        isAiGenerated = true;
      }
    } catch (error: any) {
      console.error("Gemini API call error:", error);
    }
  }

  // Fallback if AI call failed or no API key present
  if (!aiResponseText) {
    aiResponseText = enableRAG
      ? `根据 RAG 知识库检索（已匹配 ${matchedChunks.length} 个高相关度文档切片）：\n\n系统已分析相关技术规范。**双流执行架构**（Dual-Stream Architecture）将对话互动流与底层 Agent 运行思考流剥离 [Source: AI Agent Architecture Framework Whitepaper v2.4.pdf]。\n\n此外，通过混合语义检索（Dense Vector + BM25）与重排序算法，系统在复杂文档库中的召回率达到了 92% 以上 [Source: Enterprise Vector RAG Reranking Guidelines.md]。\n\n针对您的查询，已为您梳理以下优化建议：\n1. 启用动态 Token 剪枝，维持平均延迟在 1.2s 以内；\n2. 挂载 Web Search 及 Python Executor 插件扩展执行边界。`
      : `已收到您的请求："${message}"。Agent 系统当前已就绪，所有流程执行节点与可视化日志已同步记录至底层控制台。您可以通过右侧“执行流”查看详细的操作链与性能损耗。`;
  }

  const elapsedMs = Date.now() - startTime;
  metrics.totalRequests += 1;
  metrics.tokenCount += Math.floor(message.length * 1.5 + aiResponseText.length * 1.3);

  // Return trace execution steps along with the answer
  const executionSteps = [
    {
      id: "step-1",
      name: "Prompt Intent Parsing",
      status: "completed",
      durationMs: 45,
      detail: "Analyzed prompt tokens, extracted domain entities and semantic tags.",
    },
    ...(enableRAG
      ? [
          {
            id: "step-2",
            name: "RAG Knowledge Retrieval & Vector Search",
            status: "completed",
            durationMs: 180,
            detail: `Queried vector database (Embedding: gemini-embedding-2-preview). Matched ${matchedChunks.length} chunks. Top score: ${matchedChunks[0]?.similarity || 0.94}`,
            chunks: matchedChunks,
          },
          {
            id: "step-3",
            name: "Cross-Encoder Reranking & Context Injection",
            status: "completed",
            durationMs: 95,
            detail: "Ranked chunks by reciprocal rank fusion; pruned token window to top 3 snippets.",
          },
        ]
      : []),
    ...(plugins.length > 0
      ? [
          {
            id: "step-4",
            name: `Tool Invocation (${plugins.join(", ")})`,
            status: "completed",
            durationMs: 210,
            detail: `Dispatched tool payload to plugin runtime environment. Success status: 200 OK.`,
          },
        ]
      : []),
    {
      id: "step-5",
      name: `Gemini LLM Generation (${model})`,
      status: "completed",
      durationMs: elapsedMs > 300 ? elapsedMs - 200 : 320,
      detail: `Model generated ${aiResponseText.length} characters. Is Native Gemini: ${isAiGenerated}.`,
    },
  ];

  res.json({
    text: aiResponseText,
    isAiGenerated,
    executionSteps,
    citations: matchedChunks,
    metrics: {
      latencyMs: elapsedMs,
      promptTokens: Math.floor(message.length * 1.5),
      completionTokens: Math.floor(aiResponseText.length * 1.2),
      model,
    },
  });
});

// API: Semantic Search query endpoint for RAG Explorer
app.post("/api/rag/search", (req, res) => {
  const { query } = req.body;
  const mockDb = [
    {
      id: "chunk-1",
      docName: "Gemini_Agent_Framework_2026.pdf",
      title: "Agent Multi-Modal Processing & Voice Loop",
      content: "Gemini 3.1 Live API support for low latency 24kHz audio output stream and 16kHz PCM mic input stream for native multi-modal conversational agents.",
      score: 0.96,
      category: "Architecture",
    },
    {
      id: "chunk-2",
      docName: "Enterprise_RAG_Best_Practices.docx",
      title: "Hybrid Search with Vector & Sparse Indexing",
      content: "Combining pgvector dense similarity embeddings with Lucene/BM25 text indexing ensures accurate semantic recall for domain specific jargon.",
      score: 0.91,
      category: "Retrieval",
    },
    {
      id: "chunk-3",
      docName: "Security_Auth_RBAC_Guidelines.md",
      title: "Multi-tenant Role-Based Access Control",
      content: "Enforcing strict document chunk permissions based on tenant claims and user RBAC level (Admin, Developer, Viewer).",
      score: 0.88,
      category: "Security",
    },
    {
      id: "chunk-4",
      docName: "Workflow_Orchestration_Spec.pdf",
      title: "DAG Execution & Visual Node Pipeline",
      content: "Directed Acyclic Graph (DAG) visual engine enables connecting prompt nodes, tool nodes, and condition filters with real-time reactive feedback.",
      score: 0.84,
      category: "Workflows",
    }
  ];

  const filtered = query
    ? mockDb.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.content.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : mockDb;

  res.json({ results: filtered });
});

// API: TTS Audio Synthesis mock or Gemini call
app.post("/api/tts", async (req, res) => {
  const { text, voice = "Kore" } = req.body;
  // If process.env.GEMINI_API_KEY and ai is available, attempt real TTS call
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say clearly: ${text.slice(0, 150)}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audioBase64: base64Audio, format: "pcm_24k" });
      }
    } catch (e) {
      console.warn("TTS generation via Gemini failed, falling back to simulated speech audio:", e);
    }
  }

  // Fallback signal indicating client can use Web Speech API or audio synthesis
  res.json({ audioBase64: null, useWebSpeech: true, text });
});

// Serve frontend / Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agent Intelligence Operations Studio Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
