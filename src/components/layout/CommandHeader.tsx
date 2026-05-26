import { Search, ChevronRight, Terminal } from "lucide-react";

export default function CommandHeader() {
  return (
    <header className="h-10 bg-white border-b border-[#cbd5e1] flex items-center justify-between px-3 flex-shrink-0 z-10">
      <div className="flex items-center text-xs text-[#64748b] font-medium font-mono">
        <span className="text-[#0f172a]">WORKSPACE</span>
        <ChevronRight className="w-3 h-3 mx-1" />
        <span className="text-[#0f172a]">SCOUTMIND</span>
        <ChevronRight className="w-3 h-3 mx-1" />
        <span>ACTIVE_TARGETS</span>
      </div>

      <div className="flex-1 max-w-2xl px-6 flex justify-center">
        <div className="relative w-full group flex items-center">
          <div className="absolute left-2 flex items-center text-[#94a3b8]">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs pl-8 pr-16 py-1 rounded-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] text-[#0f172a] placeholder-[#94a3b8] transition-all font-mono"
            placeholder="Agent Command > type 'find similar players to E. Haaland with low injury risk'..."
          />
          <div className="absolute right-2 flex items-center gap-1">
            <span className="text-[10px] text-[#94a3b8] border border-[#cbd5e1] rounded-sm px-1 font-sans">Ctrl</span>
            <span className="text-[10px] text-[#94a3b8] border border-[#cbd5e1] rounded-sm px-1 font-sans">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#64748b] font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
          <span>ELASTIC_SYNC</span>
        </div>
        <div className="h-3 w-px bg-[#cbd5e1]"></div>
        <span>USER:S.STAFF</span>
      </div>
    </header>
  );
}
