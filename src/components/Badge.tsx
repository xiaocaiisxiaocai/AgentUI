import React from "react";

export type DataSourceTag = "LIVE" | "MOCK" | "SIMULATED" | "NOT CONNECTED" | "NOT_CONNECTED";

interface BadgeProps {
  type?: DataSourceTag | string;
  size?: "sm" | "md";
  className?: string;
}

export const DataSourceBadge: React.FC<BadgeProps> = ({ type = "MOCK", size = "sm", className = "" }) => {
  const normType = (type || "").toUpperCase().replace("_", " ");

  let colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  let label = "MOCK";

  if (normType.includes("LIVE")) {
    colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    label = "LIVE";
  } else if (normType.includes("SIMULAT")) {
    colorClasses = "bg-purple-500/10 text-purple-300 border-purple-500/30";
    label = "SIMULATED";
  } else if (normType.includes("NOT") || normType.includes("DISCONNECT") || normType.includes("OFFLINE")) {
    colorClasses = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    label = "NOT CONNECTED";
  } else {
    colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    label = "MOCK";
  }

  const padding = size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center space-x-1 font-mono font-bold uppercase rounded border ${padding} ${colorClasses} ${className}`}
      title={`数据来源标识: ${label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{label}</span>
    </span>
  );
};
