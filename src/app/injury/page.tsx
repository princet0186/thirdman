import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import { AlertCircle, Activity } from "lucide-react";

export default function InjuryPage() {
  return (
    <div className="h-full flex gap-2">
      <div className="w-64 bg-white border border-[#cbd5e1] rounded-sm flex flex-col flex-shrink-0 shadow-sm overflow-hidden">
        <div className="h-8 border-b border-[#cbd5e1] bg-[#f8fafc] flex items-center px-3 text-xs font-semibold text-[#334155] uppercase tracking-wider">
          InjuryIQ Context
        </div>
        <div className="flex-1 overflow-y-auto">
          <ContextTree />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-sm p-3 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#ef4444]" />
                Squad Workload & Injury Risk Dashboard
              </h2>
              <p className="text-xs text-[#64748b] mt-1">Analyzing fast bowler workload spikes during dense IPL schedules.</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#e2e8f0] rounded bg-[#f8fafc]">
             <div className="text-center">
               <AlertCircle className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
               <p className="text-sm font-mono text-[#64748b]">INJURY_IQ_VISUALIZATION_READY</p>
               <p className="text-xs text-[#94a3b8] mt-1">Full fast-bowling biomechanics graphs would render here.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="w-[340px] bg-[#f8fafc] border border-[#cbd5e1] rounded-sm flex flex-col flex-shrink-0 shadow-sm">
        <AIPanel />
      </div>
    </div>
  );
}
