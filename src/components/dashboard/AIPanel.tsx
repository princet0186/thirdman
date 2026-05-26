import { Sparkles, Terminal, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AIPanel() {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="h-8 border-b border-[#cbd5e1] bg-white flex items-center px-3 justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wider">Agent Builder</span>
        </div>
        <span className="text-[10px] font-mono text-[#16a34a] bg-[#dcfce7] px-1.5 rounded-sm">ONLINE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-[#64748b]">SYS // REASONING_ENGINE</div>
          <div className="bg-white border border-[#e2e8f0] p-2 rounded-sm text-xs text-[#334155] shadow-sm font-sans leading-relaxed">
            I've processed the dataset <strong>IPL Auction Pool '26</strong>. Found 84 all-rounders matching the profile "Similar to Hardik Pandya".
            Filtering out players with <strong>high injury risk (InjuryIQ &gt; 50%)</strong> reduced the list to 12 candidates.
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-mono text-[#64748b]">SYS // EXECUTION_STEPS</div>
          <div className="bg-white border border-[#e2e8f0] p-2 rounded-sm shadow-sm space-y-2">
            <div className="flex gap-2 items-start text-xs text-[#0f172a]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] mt-0.5 flex-shrink-0" />
              <span>Semantic search via Elastic (Vector) on scouting reports</span>
            </div>
            <div className="flex gap-2 items-start text-xs text-[#0f172a]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] mt-0.5 flex-shrink-0" />
              <span>Cross-referenced InjuryIQ fast-bowling workloads</span>
            </div>
            <div className="flex gap-2 items-start text-xs text-[#64748b]">
              <div className="w-3.5 h-3.5 border-2 border-[#cbd5e1] border-t-[#3b82f6] rounded-full animate-spin mt-0.5 flex-shrink-0" />
              <span>Analyzing FormCast T20 strike-rates for selected 12 candidates...</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-mono text-[#64748b]">RECOMMENDED_ACTIONS</div>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between text-left text-xs bg-white border border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#eff6ff] transition-colors p-2 rounded-sm text-[#0f172a]">
              <span>Highlight top 5 FormCast trajectories</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8]" />
            </button>
            <button className="w-full flex items-center justify-between text-left text-xs bg-white border border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#eff6ff] transition-colors p-2 rounded-sm text-[#0f172a]">
              <span>Generate OpponentEdge spin matchup report</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8]" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#cbd5e1] bg-white">
        <div className="text-[10px] font-mono text-[#64748b] mb-1">TERMINAL // INPUT</div>
        <div className="relative">
          <textarea 
            rows={2}
            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs p-2 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] resize-none font-mono"
            placeholder="Instruct the agent..."
          ></textarea>
          <button className="absolute bottom-2 right-2 bg-[#0f172a] text-white p-1 rounded-sm hover:bg-[#334155]">
            <Terminal className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
