import React, { useState } from "react";
import {
  Plug,
  Globe,
  Code2,
  Database,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Code,
  Copy,
  Check,
  Terminal,
  Key,
  KeyRound,
  FileSpreadsheet,
  Webhook,
  Sparkles,
  Server,
  Send,
  Layers,
  Building2,
} from "lucide-react";
import { AgentPlugin, AppLanguage, OpenApiEndpoint } from "../types";
import { initialOpenApiEndpoints } from "../data/mockKnowledge";
import { t } from "../i18n/translations";

interface PluginMarketplaceProps {
  plugins: AgentPlugin[];
  onTogglePlugin: (id: string) => void;
  lang: AppLanguage;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({
  plugins,
  onTogglePlugin,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<"openapi" | "plugins" | "keys">("openapi");
  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenApiEndpoint>(initialOpenApiEndpoints[0]);
  const [codeLang, setCodeLang] = useState<"curl" | "python" | "node">("curl");
  const [copiedCode, setCopiedCode] = useState(false);
  const [apiKeyList, setApiKeyList] = useState([
    { id: "key-1", name: "OA办公系统接入 Key", dept: "通用行政部", key: "ak_live_79a2b8...x91", status: "活跃" },
    { id: "key-2", name: "售后微信工单 Bot Key", dept: "售后技术部", key: "ak_live_14f3c2...p88", status: "活跃" },
    { id: "key-3", name: "Excel 自动化宏工具 Key", dept: "运营助理部", key: "ak_live_90e5a1...m02", status: "预留" },
  ]);
  const [newKeyDept, setNewKeyDept] = useState("售后技术部");
  const [newKeyName, setNewKeyName] = useState("");

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Plug":
        return Plug;
      case "Code2":
      case "FileSpreadsheet":
        return FileSpreadsheet;
      case "Database":
        return Database;
      case "Mail":
        return Mail;
      case "Globe":
        return Globe;
      default:
        return Server;
    }
  };

  const getCodeSnippet = () => {
    if (codeLang === "curl") {
      return `curl -X ${selectedEndpoint.method} "https://api.internal.company.com${selectedEndpoint.path}" \\
  -H "Authorization: Bearer YOUR_DEPARTMENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${selectedEndpoint.sampleRequest.replace(/\n/g, "")}'`;
    } else if (codeLang === "python") {
      return `import requests

url = "https://api.internal.company.com${selectedEndpoint.path}"
headers = {
    "Authorization": "Bearer YOUR_DEPARTMENT_API_KEY",
    "Content-Type": "application/json"
}
payload = ${selectedEndpoint.sampleRequest}

response = requests.${selectedEndpoint.method.toLowerCase()}(url, json=payload, headers=headers)
print("Response:", response.json())`;
    } else {
      return `import axios from 'axios';

const response = await axios({
  method: '${selectedEndpoint.method}',
  url: 'https://api.internal.company.com${selectedEndpoint.path}',
  headers: {
    'Authorization': 'Bearer YOUR_DEPARTMENT_API_KEY',
    'Content-Type': 'application/json'
  },
  data: ${selectedEndpoint.sampleRequest}
});

console.log('Result:', response.data);`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newKey = {
      id: "key-" + Date.now(),
      name: newKeyName.trim(),
      dept: newKeyDept,
      key: `ak_live_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 5)}`,
      status: "已启用",
    };
    setApiKeyList([...apiKeyList, newKey]);
    setNewKeyName("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
            <Plug className="w-6 h-6 text-blue-400" />
            <span>Agent 开放接口与 API 扩展中心 (OpenAPI & Agent Hub)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            开放 RESTful HTTP & Webhook 开放调用接口，支持第三方 OA、ERP 或次级 Agent 协同接入与凭证管理。
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center bg-white dark:bg-[#121215] border border-neutral-200 dark:border-white/10 p-1 rounded-lg space-x-1">
          <button
            onClick={() => setActiveTab("openapi")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "openapi"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>OpenAPI 开放接口</span>
          </button>
          <button
            onClick={() => setActiveTab("keys")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "keys"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>部门 API 密钥凭证</span>
          </button>
          <button
            onClick={() => setActiveTab("plugins")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "plugins"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>扩展插件服务 ({plugins.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OpenAPI Interactive Endpoint Explorer */}
      {activeTab === "openapi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Endpoint List Sidebar */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span>预留开放 REST / Webhook 接口列表</span>
            </h3>

            <div className="space-y-2">
              {initialOpenApiEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedEndpoint.id === ep.id
                      ? "border-blue-500 bg-blue-500/10 shadow-md"
                      : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ep.method === "POST"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {ep.path}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        ep.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {ep.status === "active" ? "在线启用" : "预留扩展"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-semibold">{ep.name}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {ep.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5">
                    <span>作用域: {ep.departmentScope}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoint Code & Playground */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>{selectedEndpoint.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedEndpoint.description}</p>
                </div>
                <div className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-white/5 p-1 rounded-md">
                  <button
                    onClick={() => setCodeLang("curl")}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                      codeLang === "curl" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setCodeLang("python")}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                      codeLang === "python" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setCodeLang("node")}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                      codeLang === "node" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Node.js
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-lg bg-neutral-900 dark:bg-[#050505] border border-neutral-800 dark:border-white/10 p-4 font-mono text-xs overflow-x-auto text-emerald-300">
                <button
                  onClick={handleCopyCode}
                  className="absolute right-3 top-3 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] flex items-center space-x-1 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制代码</span>
                    </>
                  )}
                </button>
                <pre className="leading-relaxed scrollbar-none">{getCodeSnippet()}</pre>
              </div>

              {/* Sample Response Preview */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono text-slate-400 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>标准 JSON 响应示例 (Sample JSON Response):</span>
                </span>
                <pre className="p-3 rounded-lg bg-neutral-950 border border-white/5 font-mono text-xs text-blue-300 overflow-x-auto">
                  {selectedEndpoint.sampleResponse}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Department API Keys & Credentials */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>部门接口鉴权凭证密钥 (Department Access Tokens)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  各部门生成专属的 API 密钥凭证，第三方系统调用开放接口时携带此凭证以实现数据隔离与流量统计。
                </p>
              </div>
            </div>

            {/* Create New Key Form */}
            <form onSubmit={handleCreateApiKey} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="密钥用途描述（例如：售后机器人接入Key）"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="sm:col-span-4">
                <select
                  value={newKeyDept}
                  onChange={(e) => setNewKeyDept(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#121215] text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="售后技术部">售后技术部</option>
                  <option value="运营助理部">运营助理部</option>
                  <option value="通用行政部">通用行政部</option>
                  <option value="财务部 (预留)">财务部 (预留)</option>
                  <option value="人力资源部 (预留)">人力资源部 (预留)</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>生成部门 API Key</span>
                </button>
              </div>
            </form>

            {/* Keys Table */}
            <div className="overflow-x-auto rounded border border-neutral-200 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#151515] text-slate-400 font-mono text-[10px] uppercase border-b border-neutral-200 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">凭证名称</th>
                    <th className="py-2.5 px-4">绑定部门</th>
                    <th className="py-2.5 px-4">API Token 密钥</th>
                    <th className="py-2.5 px-4">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/5 text-slate-300">
                  {apiKeyList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-bold">{item.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">
                          {item.dept}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{item.key}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Extensions & Plugins Grid */}
      {activeTab === "plugins" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map((plugin) => {
            const Icon = getIcon(plugin.icon);
            return (
              <div
                key={plugin.id}
                className={`p-4 rounded border bg-white dark:bg-[#0d0d0d] shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  plugin.enabled
                    ? "border-blue-500/50"
                    : "border-neutral-200 dark:border-white/10 opacity-70"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-white/5 text-slate-400 border border-white/5">
                      {plugin.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-slate-200">
                      {plugin.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {plugin.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {Object.values(plugin.config)[0]}
                  </span>

                  <button
                    onClick={() => onTogglePlugin(plugin.id)}
                    className={`px-3 py-1 rounded font-mono font-bold text-xs transition-colors ${
                      plugin.enabled
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-white/10 hover:bg-white/20 text-slate-300"
                    }`}
                  >
                    {plugin.enabled ? t("enablePlugin", lang) : t("disablePlugin", lang)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

