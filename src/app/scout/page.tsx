"use client";

import OverviewCharts from "@/components/dashboard/OverviewCharts";
import PlayersTable from "@/components/dashboard/PlayersTable";
import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import { useAppContext } from "@/lib/AppContext";
import { useEffect } from "react";

export default function ScoutPage() {
  const { activeDataset, isRefreshing, selectedPlayer, setCurrentModule } = useAppContext();

  useEffect(() => { setCurrentModule("scout"); }, [setCurrentModule]);

  return (
    <div className="h-full flex gap-2">
      <div className="w-64 bg-white border border-[#cbd5e1] rounded-sm flex flex-col flex-shrink-0 shadow-sm overflow-hidden">
        <div className="h-8 border-b border-[#cbd5e1] bg-[#f8fafc] flex items-center px-3 text-xs font-semibold text-[#334155] uppercase tracking-wider">
          ScoutMind Query
        </div>
        <div className="flex-1 overflow-y-auto">
          <ContextTree />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#0f172a]">Target Analytics Workspace</h2>
            <div className="flex gap-2 items-center">
              {isRefreshing && (
                <span className="px-2 py-0.5 bg-[#fef3c7] border border-[#fde68a] text-xs font-mono text-[#92400e] rounded-sm animate-pulse">
                  REFRESHING DATA...
                </span>
              )}
              {selectedPlayer && (
                <span className="px-2 py-0.5 bg-[#eff6ff] border border-[#bfdbfe] text-xs font-mono text-[#3b82f6] rounded-sm">
                  TARGET: {selectedPlayer.name}
                </span>
              )}
              <span className="px-2 py-0.5 bg-[#f1f5f9] border border-[#cbd5e1] text-xs font-mono text-[#475569] rounded-sm">
                ROWS: 420
              </span>
              <span className="px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-xs font-mono text-[#16a34a] rounded-sm">
                DS: {activeDataset.length > 18 ? activeDataset.slice(0, 18) + "…" : activeDataset}
              </span>
            </div>
          </div>
          <OverviewCharts />
        </div>

        <div className="flex-1 bg-white border border-[#cbd5e1] rounded-sm shadow-sm overflow-hidden flex flex-col">
          <PlayersTable />
        </div>
      </div>

      <div className="w-[340px] bg-[#f8fafc] border border-[#cbd5e1] rounded-sm flex flex-col flex-shrink-0 shadow-sm">
        <AIPanel />
      </div>
    </div>
  );
}
