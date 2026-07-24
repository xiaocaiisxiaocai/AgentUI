import React from "react";
import {
  BarChart3,
  Zap,
  Database,
  Cpu,
  Bot,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { SystemMetrics, AppLanguage } from "../types";
import { t } from "../i18n/translations";

interface AnalyticsDashboardProps {
  metrics: SystemMetrics;
  lang: AppLanguage;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
  lang,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-neutral-50 dark:bg-[#050505]">
      {/* Banner */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <span>{t("analyticsHeading", lang)}</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-1">
          实时监控系统 QPS、延迟分位 (P95/P99)、RAG 召回命中率与 Token 消耗曲线。
        </p>
      </div>

      {/* Top 6 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title={t("totalReqs", lang)}
          value={metrics.totalRequests.toLocaleString()}
          icon={Activity}
          trend="+12.4%"
          color="indigo"
        />
        <MetricCard
          title={t("avgLatency", lang)}
          value={`${metrics.avgLatencyMs} ms`}
          icon={Clock}
          trend="-85ms"
          color="purple"
        />
        <MetricCard
          title={t("ragHitRate", lang)}
          value={`${metrics.ragHitRate}%`}
          icon={Database}
          trend="+2.1%"
          color="emerald"
        />
        <MetricCard
          title={t("totalTokens", lang)}
          value={`${(metrics.tokenCount / 1000).toFixed(0)}k`}
          icon={Cpu}
          trend="+45k"
          color="amber"
        />
        <MetricCard
          title="活跃 Agent 节点"
          value={metrics.activeAgents.toString()}
          icon={Bot}
          trend="Stable"
          color="blue"
        />
        <MetricCard
          title="错误与异常"
          value={metrics.errorCount.toString()}
          icon={AlertTriangle}
          trend="0.16%"
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QPS & Latency Trend Chart */}
        <div className="p-5 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-800 dark:text-slate-200">
                {t("qpsTrend", lang)}
              </h3>
              <p className="text-xs text-neutral-400">请求量 QPS 与响应延迟 (ms) 对应趋势</p>
            </div>
            <span className="text-xs font-mono text-blue-400 font-semibold uppercase">24 Hours</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.qpsHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#151515",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="qps"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#c084fc"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Token Distribution Area Chart */}
        <div className="p-5 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-800 dark:text-slate-200">
                {t("tokenTrend", lang)}
              </h3>
              <p className="text-xs text-neutral-400">Prompt 输入 Tokens 与 Output 输出 Tokens 损耗</p>
            </div>
            <span className="text-xs font-mono text-purple-400 font-semibold uppercase">Weekly</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.tokenUsageHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#151515",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="promptTokens"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="completionTokens"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: any;
  trend: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
}) => {
  return (
    <div className="p-3.5 rounded border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-sm space-y-1.5">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-mono font-medium truncate uppercase text-[11px]">{title}</span>
        <Icon className="w-4 h-4 text-blue-400 shrink-0" />
      </div>
      <div className="text-xl sm:text-2xl font-bold font-mono text-neutral-900 dark:text-slate-100">
        {value}
      </div>
      <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
        <TrendingUp className="w-3 h-3" />
        <span>{trend} vs last period</span>
      </div>
    </div>
  );
};
