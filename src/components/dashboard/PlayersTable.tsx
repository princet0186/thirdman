import { Filter, Download, MoreHorizontal, Settings2 } from "lucide-react";

export default function PlayersTable() {
  const players = [
    { id: "CRK-8472", name: "V. Kohli", role: "BAT", age: 35, avg: 52.7, sr: 138.2, injuryRisk: 8, rating: 9.4, team: "RCB / IND" },
    { id: "CRK-1934", name: "J. Bumrah", role: "PACE", age: 30, avg: 20.4, sr: 14.5, injuryRisk: 42, rating: 9.8, team: "MI / IND" },
    { id: "CRK-5521", name: "H. Pandya", role: "ALL", age: 30, avg: 31.2, sr: 145.6, injuryRisk: 65, rating: 8.6, team: "MI / IND" },
    { id: "CRK-3310", name: "R. Khan", role: "SPIN", age: 25, avg: 15.3, sr: 12.1, injuryRisk: 12, rating: 9.2, team: "GT / AFG" },
    { id: "CRK-9122", name: "T. Head", role: "BAT", age: 30, avg: 40.1, sr: 165.4, injuryRisk: 18, rating: 9.0, team: "SRH / AUS" },
    { id: "CRK-4015", name: "P. Cummins", role: "ALL", age: 31, avg: 24.5, sr: 18.2, injuryRisk: 25, rating: 8.9, team: "SRH / AUS" },
    { id: "CRK-7721", name: "M. Siraj", role: "PACE", age: 29, avg: 26.1, sr: 19.0, injuryRisk: 35, rating: 8.1, team: "RCB / IND" },
    { id: "CRK-1198", name: "N. Pooran", role: "WK-BAT", age: 28, avg: 34.2, sr: 155.8, injuryRisk: 10, rating: 8.5, team: "LSG / WI" },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#cbd5e1] bg-[#f8fafc]">
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#334155] bg-white border border-[#cbd5e1] rounded-sm hover:bg-[#f1f5f9]">
            <Filter className="w-3 h-3" />
            FILTER [Active: IPL 2026]
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#334155] bg-white border border-[#cbd5e1] rounded-sm hover:bg-[#f1f5f9]">
            <Settings2 className="w-3 h-3" />
            COLUMNS
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#334155] bg-white border border-[#cbd5e1] rounded-sm hover:bg-[#f1f5f9]">
            <Download className="w-3 h-3" />
            EXPORT JSON
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider border-b border-[#cbd5e1]">
              <th className="px-3 py-2 font-mono">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2 text-right font-mono">Age</th>
              <th className="px-3 py-2 text-right">Avg (Bat/Bowl)</th>
              <th className="px-3 py-2 text-right">SR</th>
              <th className="px-3 py-2 text-right">Risk %</th>
              <th className="px-3 py-2 text-right font-mono">Form</th>
              <th className="px-3 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="text-[12px] divide-y divide-[#e2e8f0]">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-[#f1f5f9] transition-colors group">
                <td className="px-3 py-1.5 text-[#64748b] font-mono text-[10px]">{player.id}</td>
                <td className="px-3 py-1.5 font-medium text-[#0f172a]">{player.name}</td>
                <td className="px-3 py-1.5 text-[#334155]">{player.team}</td>
                <td className="px-3 py-1.5">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-medium text-white ${
                    player.role === 'BAT' ? 'bg-[#3b82f6]' : 
                    player.role === 'PACE' ? 'bg-[#ef4444]' : 
                    player.role === 'SPIN' ? 'bg-[#f59e0b]' : 
                    'bg-[#8b5cf6]'
                  }`}>
                    {player.role}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-[#334155]">{player.age}</td>
                <td className="px-3 py-1.5 text-right font-mono text-[#334155]">{player.avg.toFixed(1)}</td>
                <td className="px-3 py-1.5 text-right font-mono text-[#334155]">{player.sr.toFixed(1)}</td>
                
                <td className="px-3 py-1.5 text-right">
                  <span className={`font-mono text-[11px] ${
                    player.injuryRisk < 20 ? 'text-[#16a34a]' : 
                    player.injuryRisk < 50 ? 'text-[#eab308]' : 
                    'text-[#ef4444] font-bold'
                  }`}>
                    {player.injuryRisk}%
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-mono font-semibold text-[#0f172a]">{player.rating.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-center">
                  <button className="text-[#94a3b8] hover:text-[#0f172a] opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-2 border-t border-[#cbd5e1] bg-[#f8fafc] text-[10px] text-[#64748b] flex justify-between items-center font-mono">
        <span>DATASET: 420 PLAYERS</span>
        <div className="flex gap-1 font-sans">
          <button className="px-2 py-0.5 border border-[#cbd5e1] rounded-sm bg-white text-[#94a3b8]" disabled>PREV</button>
          <button className="px-2 py-0.5 border border-[#cbd5e1] rounded-sm bg-white hover:bg-[#e2e8f0] text-[#334155]">NEXT</button>
        </div>
      </div>
    </div>
  );
}
