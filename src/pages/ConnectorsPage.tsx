import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Link2,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Lock,
  Server,
} from "lucide-react";
import { ConnectorDefinition, AppLanguage } from "../types";
import { useAppStore } from "../store/useAppStore";

interface ConnectorsPageProps {
  connectors?: ConnectorDefinition[];
  onAddConnector?: (connector: ConnectorDefinition) => void;
  lang?: AppLanguage;
}

export const ConnectorsPage: React.FC<ConnectorsPageProps> = (props) => {
  const { id: paramId } = useParams<{ id?: string }>();
  const store = useAppStore();
  const connectors = props.connectors || store.connectors;
  const onAddConnector = props.onAddConnector || store.addConnector;

  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(paramId || null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    if (paramId) {
      setSelectedConnectorId(paramId);
    }
  }, [paramId]);

  const handleTriggerSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-50 dark:bg-[#050505]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Link2 className="w-6 h-6 text-blue-400" />
            <span>连接器中心 (Connector Center)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
            企业级物理数据管道连接器，管理 SQL Server、SharePoint、OA REST API 与 MySQL 自动增量同步。
          </p>
        </div>

        <button
          onClick={() => {
            const newConn: ConnectorDefinition = {
              id: "conn-" + Date.now(),
              name: "新建 ERP MySQL 数据连接器",
              type: "MySQL",
              endpoint: "mysql://erp.company.com:3306/db",
              department: "运营助理部",
              status: "connected",
              syncPolicy: "hourly",
              lastSyncTime: "刚刚",
              readOnly: true,
            };
            onAddConnector(newConn);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>新建连接器</span>
        </button>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {connectors.map((conn) => (
          <div
            key={conn.id}
            className="p-5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-slate-100">{conn.name}</h3>
                    <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">{conn.type} | {conn.department}</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center space-x-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>已连接</span>
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 font-mono text-xs sm:text-sm text-blue-800 dark:text-blue-300 break-all font-semibold">
                {conn.endpoint}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-600 dark:text-slate-400 bg-neutral-50 dark:bg-white/5 p-2.5 rounded-lg border border-neutral-100 dark:border-transparent">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500 dark:text-slate-500" />
                  <span>策略: <strong className="text-neutral-900 dark:text-slate-200">{conn.syncPolicy}</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-neutral-500 dark:text-slate-500" />
                  <span>权限: <strong className="text-neutral-900 dark:text-slate-200">{conn.readOnly ? "只读 (ReadOnly)" : "读写 (ReadWrite)"}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">上次增量同步: {conn.lastSyncTime}</span>
              <button
                onClick={() => handleTriggerSync(conn.id)}
                disabled={syncingId === conn.id}
                className="px-3.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold font-mono text-xs sm:text-sm border border-blue-300 dark:border-blue-500/30 flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncingId === conn.id ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`} />
                <span>{syncingId === conn.id ? "同步中..." : "立即增量同步"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
