import OverviewCharts from "@/components/dashboard/OverviewCharts";
import PlayersTable from "@/components/dashboard/PlayersTable";
import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";

export default function ScoutPage() {
  return (
    <div className="h-full flex gap-2">
      {/* Pane 1: Context / Directory */}
      <div className="w-64 bg-white border border-[#cbd5e1] rounded-sm flex flex-col flex-shrink-0 shadow-sm overflow-hidden">
        <div className="h-8 border-b border-[#cbd5e1] bg-[#f8fafc] flex items-center px-3 text-xs font-semibold text-[#334155] uppercase tracking-wider">
          ScoutMind Query
        </div>
        <div className="flex-1 overflow-y-auto">
          <ContextTree />
        </div>
      </div>

      {/* Pane 2: Main Workbench */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#0f172a]">Target Analytics Workspace</h2>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-[#f1f5f9] border border-[#cbd5e1] text-xs font-mono text-[#475569] rounded-sm">
                ROWS: 420
              </span>
              <span className="px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-xs font-mono text-[#16a34a] rounded-sm">
                LAST_SYNC: 2M AGO
              </span>
            </div>
          </div>
          <OverviewCharts />
        </div>
        
        <div className="flex-1 bg-white border border-[#cbd5e1] rounded-sm shadow-sm overflow-hidden flex flex-col">
          <PlayersTable />
        </div>
      </div>

      {/* Pane 3: AI Copilot */}
      <div className="w-[340px] bg-[#f8fafc] border border-[#cbd5e1] rounded-sm flex flex-col flex-shrink-0 shadow-sm">
        <AIPanel />
      </div>
    </div>
  );
}
