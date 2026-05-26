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
      {/* Context sidebar - pitch cream with boundary rope border */}
      <div className="w-64 bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md overflow-hidden">
        <div className="h-8 border-b-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center px-3 text-xs font-semibold text-white uppercase tracking-wider">
          ScoutMind Query
        </div>
        <div className="flex-1 overflow-y-auto">
          <ContextTree />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Charts panel - boundary rope border */}
        <div className="bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#0f172a]">Target Analytics Workspace</h2>
            <div className="flex gap-2 items-center">
              {isRefreshing && (
                <span className="px-2 py-0.5 bg-[#fef3c7] border border-[#fcd34d] text-xs font-mono text-[#92400e] rounded-sm animate-pulse">
                  REFRESHING DATA...
                </span>
              )}
              {selectedPlayer && (
                <span className="px-2 py-0.5 bg-[#fef9ee] border border-[#ca8a04] text-xs font-mono text-[#92400e] rounded-sm">
                  TARGET: {selectedPlayer.name}
                </span>
              )}
              <span className="px-2 py-0.5 bg-[#f5f0e8] border border-[#d6c4a8] text-xs font-mono text-[#6b7280] rounded-sm">
                ROWS: 420
              </span>
              <span className="px-2 py-0.5 bg-[#eef5e6] border border-[#86efac] text-xs font-mono text-[#166534] rounded-sm">
                DS: {activeDataset.length > 18 ? activeDataset.slice(0, 18) + "…" : activeDataset}
              </span>
            </div>
          </div>
          <OverviewCharts />
        </div>

        {/* Players table - boundary rope border */}
        <div className="flex-1 bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md overflow-hidden flex flex-col">
          <PlayersTable />
        </div>
      </div>

      {/* AI Panel - boundary rope border */}
      <div className="w-[340px] bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md">
        <AIPanel />
      </div>
    </div>
  );
}
