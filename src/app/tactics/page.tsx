"use client";

import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import { Shield, Crosshair, PieChart as PieChartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/AppContext";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from "recharts";

const ROLE_COLORS: Record<string, string> = {
  BAT: "#ca8a04",
  PACE: "#ef4444",
  SPIN: "#166534",
  ALL: "#8b5cf6",
  "WK-BAT": "#06b6d4",
  UNKNOWN: "#b8976a"
};

export default function TacticsPage() {
  const { setCurrentModule } = useAppContext();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setCurrentModule("tactics");
    fetch("http://localhost:8000/api/stats/role-distribution")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [setCurrentModule]);

  const pieData = stats?.roles ? Object.entries(stats.roles).map(([name, value]) => ({
    name, value
  })) : [];

  const topTeams = stats?.teams ? Object.entries(stats.teams)
    .map(([name, value]) => ({ name, count: value as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) : [];

  return (
    <div className="h-full flex gap-2">
      <div className="w-64 bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md overflow-hidden">
        <div className="h-8 border-b-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center px-3 text-xs font-semibold text-white uppercase tracking-wider">
          OpponentEdge Context
        </div>
        <div className="flex-1 overflow-y-auto">
          <ContextTree />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md p-3 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ca8a04]" />
                Tactical Matchups & Profiling
              </h2>
              <p className="text-xs text-[#6b7280] mt-1">Analyzing macro team compositions and role distribution.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#14532d] bg-[#eef5e6] px-2 py-1 rounded-sm border border-[#86efac]">
                DATASET SIZE: {stats ? stats.total : "--"} PLAYERS
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col">
               <h3 className="text-xs font-semibold text-[#14532d] mb-4 uppercase flex items-center gap-1.5">
                 <PieChartIcon className="w-3.5 h-3.5 text-[#ca8a04]" /> Global Role Distribution
               </h3>
               <div className="flex-1 min-h-[200px]">
                 {pieData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={2}
                         dataKey="value"
                         stroke="none"
                       >
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name] || ROLE_COLORS.UNKNOWN} />
                         ))}
                       </Pie>
                       <RechartsTooltip contentStyle={{ fontSize: '12px', borderRadius: '4px', border: '1px solid #b8976a', backgroundColor: '#faf8f3' }} />
                       <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} iconType="circle" />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono">LOADING DISTRIBUTION...</div>
                 )}
               </div>
            </div>

            <div className="border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col">
               <h3 className="text-xs font-semibold text-[#14532d] mb-2 uppercase flex items-center gap-1.5">
                 <Crosshair className="w-3.5 h-3.5 text-[#ca8a04]" /> Top Talent Origins
               </h3>
               <div className="flex-1 overflow-y-auto pr-2">
                 {topTeams.length > 0 ? (
                   <table className="w-full text-left text-xs whitespace-nowrap">
                     <thead className="bg-[#eef5e6] sticky top-0">
                       <tr>
                         <th className="px-2 py-1.5 font-medium text-[#14532d]">Team / Origin</th>
                         <th className="px-2 py-1.5 font-medium text-[#14532d] text-right">Player Count</th>
                         <th className="px-2 py-1.5 font-medium text-[#14532d]">Density Bar</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-[#d6c4a8]">
                       {topTeams.map((t) => {
                         const max = topTeams[0].count;
                         const width = `${(t.count / max) * 100}%`;
                         return (
                           <tr key={t.name} className="hover:bg-[#f0ebe0] transition-colors">
                             <td className="px-2 py-1.5 font-medium text-[#0f172a]">{t.name}</td>
                             <td className="px-2 py-1.5 font-mono text-right text-[#374151]">{t.count}</td>
                             <td className="px-2 py-1.5 w-1/2">
                               <div className="h-1.5 bg-[#d6c4a8] rounded-sm overflow-hidden w-full max-w-[100px]">
                                 <div className="h-full bg-[#166534]" style={{ width }}></div>
                               </div>
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 ) : (
                   <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono">LOADING ORIGINS...</div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[340px] bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md">
        <AIPanel />
      </div>
    </div>
  );
}
