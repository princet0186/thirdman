"use client";

import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import { AlertCircle, Activity, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/AppContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from "recharts";

export default function InjuryPage() {
  const { setCurrentModule, players } = useAppContext();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setCurrentModule("injury");
    fetch("http://localhost:8000/api/stats/injury-distribution")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [setCurrentModule]);

  const distributionData = stats ? [
    { name: "Low (<30%)", count: stats.low, color: "#16a34a" },
    { name: "Medium (30-60%)", count: stats.medium, color: "#eab308" },
    { name: "High (>60%)", count: stats.high, color: "#ef4444" },
  ] : [];

  return (
    <div className="h-full flex gap-2">
      <div className="w-64 bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md overflow-hidden">
        <div className="h-8 border-b-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center px-3 text-xs font-semibold text-white uppercase tracking-wider">
          InjuryIQ Context
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
                <Activity className="w-4 h-4 text-[#ef4444]" />
                Squad Workload & Injury Risk Dashboard
              </h2>
              <p className="text-xs text-[#6b7280] mt-1">Global Player Database Injury Risk Distribution.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#ef4444]">
                {stats ? stats.high : "--"} PLAYERS AT HIGH RISK
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col">
               <h3 className="text-xs font-semibold text-[#14532d] mb-4 uppercase">Risk Distribution</h3>
               <div className="flex-1 min-h-[200px]">
                 {stats ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={distributionData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d6c4a8" />
                       <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: '#d6c4a8' }} tickLine={false} />
                       <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                       <RechartsTooltip contentStyle={{ fontSize: '12px', borderRadius: '4px', border: '1px solid #b8976a', backgroundColor: '#faf8f3' }} cursor={{ fill: 'rgba(214, 196, 168, 0.3)' }} />
                       <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                         {distributionData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono">LOADING DISTRIBUTION...</div>
                 )}
               </div>
            </div>

            <div className="border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col">
               <h3 className="text-xs font-semibold text-[#14532d] mb-2 uppercase flex items-center gap-1.5">
                 <AlertCircle className="w-3.5 h-3.5 text-[#ef4444]" /> Critical Watchlist
               </h3>
               <div className="flex-1 overflow-y-auto pr-2">
                 {stats?.highRiskPlayers ? (
                   <table className="w-full text-left text-xs whitespace-nowrap">
                     <thead className="bg-[#eef5e6] sticky top-0">
                       <tr>
                         <th className="px-2 py-1.5 font-medium text-[#14532d]">Player</th>
                         <th className="px-2 py-1.5 font-medium text-[#14532d]">Role</th>
                         <th className="px-2 py-1.5 font-medium text-[#14532d] text-right">Risk %</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-[#d6c4a8]">
                       {stats.highRiskPlayers.map((p: any) => (
                         <tr key={p.id} className="hover:bg-[#f0ebe0] transition-colors">
                           <td className="px-2 py-1.5 font-medium text-[#0f172a]">{p.name}</td>
                           <td className="px-2 py-1.5 text-[#6b7280]">{p.role}</td>
                           <td className="px-2 py-1.5 font-mono text-right text-[#ef4444] font-bold">{p.injuryRisk}%</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 ) : (
                   <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono">LOADING WATCHLIST...</div>
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
