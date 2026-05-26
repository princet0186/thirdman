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
  const { activeDataset, setActiveDataset, isRefreshing, currentModule } = useAppContext();

  // Dynamic content based on the module
  const isInjury = currentModule === "injury";
  
  const memories = isInjury ? [
    'Prev: "Low risk pacers under 25"',
    'Prev: "Replace Bumrah for T20 WC"',
    'Prev: "Squad injury risk overview"',
  ] : [
    'Prev: "Find left-arm death bowlers"',
    'Prev: "Injury risk for pacers in May"',
    'Prev: "Top 5 T20 all-rounders U-28"',
  ];

  const reports = isInjury ? [
    "Medical Clearance: T20 WC",
    "Bumrah Rehab Timeline",
  ] : [
    "Asia Cup Squad Targets",
    "IPL Retention Analysis",
  ];

  return (
    <div className="py-2">
      <div className="px-2">
        <div className="text-[10px] font-bold text-[#b8976a] uppercase mb-1 px-1 flex items-center gap-1.5">
          Active Datasets
          {isRefreshing && (
            <RefreshCw className="w-2.5 h-2.5 text-[#ca8a04] animate-spin" />
          )}
        </div>
        <ul className="text-xs space-y-0.5">
          <li>
            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#f0ebe0] text-[#0f172a] rounded-sm text-left">
              <ChevronDown className="w-3 h-3 text-[#b8976a]" />
              <Database className="w-3.5 h-3.5 text-[#166534]" />
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
                          ? "text-[#0f172a] bg-[#fef3c7] font-medium border-l-2 border-[#ca8a04]"
                          : "text-[#374151] hover:bg-[#f0ebe0] border-l-2 border-transparent"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#ca8a04]" : "text-[#b8976a]"}`} />
                      <span className="truncate">{ds.name}</span>
                      {isActive && (
                        <span className="ml-auto text-[8px] font-mono text-[#92400e] bg-[#fef3c7] px-1 rounded-sm flex-shrink-0 border border-[#fcd34d]">
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
            <button className={`w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#f0ebe0] rounded-sm text-left mt-1 ${isInjury ? "text-[#0f172a] bg-[#fef3c7] font-medium border-l-2 border-[#ca8a04]" : "text-[#0f172a]"}`}>
              <ChevronRight className={`w-3 h-3 ${isInjury ? "text-[#ca8a04]" : "text-[#b8976a]"}`} />
              <Database className={`w-3.5 h-3.5 ${isInjury ? "text-[#ca8a04]" : "text-[#166534]"}`} />
              <span className="font-medium">BCCI Medical Records</span>
              {isInjury && (
                <span className="ml-auto text-[8px] font-mono text-[#92400e] bg-[#fef3c7] px-1 rounded-sm flex-shrink-0 border border-[#fcd34d]">
                  ACTIVE
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>

      <div className="px-2 mt-4">
        <div className="text-[10px] font-bold text-[#b8976a] uppercase mb-1 px-1">Agent Memory</div>
        <ul className="text-xs space-y-0.5">
          {memories.map((mem) => (
            <li key={mem}>
              <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#374151] hover:bg-[#f0ebe0] rounded-sm text-left">
                <Brain className="w-3.5 h-3.5 text-[#ca8a04] flex-shrink-0" />
                <span className="truncate">{mem}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-2 mt-4">
        <div className="text-[10px] font-bold text-[#b8976a] uppercase mb-1 px-1">Saved Reports</div>
        <ul className="text-xs space-y-0.5">
          {reports.map((rpt) => (
            <li key={rpt}>
              <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#374151] hover:bg-[#f0ebe0] rounded-sm text-left">
                <FileText className="w-3.5 h-3.5 text-[#b8976a]" />
                <span>{rpt}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
