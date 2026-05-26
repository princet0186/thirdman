import { Database, Folder, Users, FileText, ChevronRight, ChevronDown, Brain } from "lucide-react";

export default function ContextTree() {
  return (
    <div className="py-2">
      <div className="px-2">
        <div className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1 px-1">Active Datasets</div>
        <ul className="text-xs space-y-0.5">
          <li>
            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#f1f5f9] text-[#0f172a] rounded-sm text-left">
              <ChevronDown className="w-3 h-3 text-[#64748b]" />
              <Database className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span className="font-medium">Global Cricket Database</span>
            </button>
            <ul className="pl-6 space-y-0.5 mt-0.5">
              <li>
                <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#334155] hover:bg-[#f1f5f9] rounded-sm text-left">
                  <Users className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>IPL Auction Pool '26</span>
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#0f172a] bg-[#e2e8f0] font-medium rounded-sm text-left border-l-2 border-[#3b82f6]">
                  <Users className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span>ICC T20 World Cup</span>
                </button>
              </li>
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
          <li>
            <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#334155] hover:bg-[#f1f5f9] rounded-sm text-left">
              <Brain className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span className="truncate">Prev: "Find left-arm death bowlers"</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#334155] hover:bg-[#f1f5f9] rounded-sm text-left">
              <Brain className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span className="truncate">Prev: "Injury risk for pacers in May"</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="px-2 mt-4">
        <div className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1 px-1">Saved Reports</div>
        <ul className="text-xs space-y-0.5">
          <li>
            <button className="w-full flex items-center gap-1.5 px-2 py-1 text-[#334155] hover:bg-[#f1f5f9] rounded-sm text-left">
              <FileText className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Asia Cup Squad Targets</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
