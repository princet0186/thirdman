"use client";

import { Database, Users, FileText, ChevronRight, ChevronDown, Brain, RefreshCw } from "lucide-react";
import { useAppContext } from "@/lib/AppContext";

const DATASETS = [
  { name: "IPL Auction Pool '26", icon: Users },
  { name: "ICC T20 World Cup",    icon: Users },
  { name: "Asia Cup Squad '26",   icon: Users },
];

const MEMORIES = [
  'Prev: "Find left-arm death bowlers"',
  'Prev: "Injury risk for pacers in May"',
  'Prev: "Top 5 T20 all-rounders U-28"',
];

const REPORTS = [
  "Asia Cup Squad Targets",
  "IPL Retention Analysis",
];

export default function ContextTree() {
  const { activeDataset, setActiveDataset, isRefreshing } = useAppContext();

  return (
    <div className="py-2">
      <div className="px-2">
        <div className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1 px-1 flex items-center gap-1.5">
          Active Datasets
          {isRefreshing && (
            <RefreshCw className="w-2.5 h-2.5 text-[#3b82f6] animate-spin" />
          )}
        </div>
        <ul className="text-xs space-y-0.5">
          <li>
            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#f1f5f9] text-[#0f172a] rounded-sm text-left">
              <ChevronDown className="w-3 h-3 text-[#64748b]" />
              <Database className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span className="font-medium">Global Cricket Database</span>
            </button>
            <ul className="pl-6 space-y-0.5 mt-0.5">
              {DATASETS.map((ds) => {
                const isActive = activeDataset === ds.name;
                const Icon = ds.icon;
                return (
                  <li key={ds.name}>
                    <button
                      id={`dataset-${ds.name.replace(/\W+/g, "-").toLowerCase()}`}
                      onClick={() => setActiveDataset(ds.name)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-sm text-left transition-all duration-200 ${
                        isActive
                          ? "text-[#0f172a] bg-[#e2e8f0] font-medium border-l-2 border-[#3b82f6]"
                          : "text-[#334155] hover:bg-[#f1f5f9] border-l-2 border-transparent"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#3b82f6]" : "text-[#64748b]"}`} />
                      <span className="truncate">{ds.name}</span>
                      {isActive && (
                        <span className="ml-auto text-[8px] font-mono text-[#3b82f6] bg-[#dbeafe] px-1 rounded-sm flex-shrink-0">
                          ACTIVE
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>

          <li>
            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#f1f5f9] text-[#0f172a] rounded-sm text-left mt-1">
              <ChevronRight className="w-3 h-3 text-[#64748b]" />
              <Database className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="font-medium">BCCI Medical Records</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="px-2 mt-4">
        <div className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1 px-1">Agent Memory</div>
        <ul className="text-xs space-y-0.5">
          {MEMORIES.map((mem) => (
            <li key={mem}>
              <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#334155] hover:bg-[#f1f5f9] rounded-sm text-left">
                <Brain className="w-3.5 h-3.5 text-[#8b5cf6] flex-shrink-0" />
                <span className="truncate">{mem}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-2 mt-4">
        <div className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1 px-1">Saved Reports</div>
        <ul className="text-xs space-y-0.5">
          {REPORTS.map((rpt) => (
            <li key={rpt}>
              <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#334155] hover:bg-[#f1f5f9] rounded-sm text-left">
                <FileText className="w-3.5 h-3.5 text-[#64748b]" />
                <span>{rpt}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
