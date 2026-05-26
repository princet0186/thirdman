"use client";

import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import { TrendingUp, LineChart as LineChartIcon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/AppContext";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from "recharts";

export default function FormPage() {
  const { setCurrentModule, selectedPlayer, players } = useAppContext();
  const [topForm, setTopForm] = useState<any[]>([]);

  useEffect(() => {
    setCurrentModule("form");
    if (players.length > 0) {
      const sorted = [...players].sort((a, b) => b.rating - a.rating).slice(0, 15);
      setTopForm(sorted);
    }
  }, [setCurrentModule, players]);

  const scatterData = players.map(p => ({
    name: p.name, avg: p.avg, sr: p.sr, rating: p.rating, role: p.role, id: p.id
  })).filter(p => p.role === 'BAT' || p.role === 'WK-BAT' || p.role === 'ALL');

  return (
    <div className="h-full flex gap-2">
      <div className="w-64 bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md overflow-hidden">
        <div className="h-8 border-b-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center px-3 text-xs font-semibold text-white uppercase tracking-wider">
          FormCast Context
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
                <TrendingUp className="w-4 h-4 text-[#ca8a04]" />
                Momentum & Peak Performance Analytics
              </h2>
              <p className="text-xs text-[#6b7280] mt-1">Predicting peak performance windows through Average vs Strike Rate clustering.</p>
            </div>
            {selectedPlayer && (
              <div className="text-right">
                <span className="text-xs font-mono bg-[#fef3c7] text-[#92400e] px-2 py-1 rounded-sm border border-[#ca8a04]">
                  TARGET: {selectedPlayer.name} [R: {selectedPlayer.rating.toFixed(1)}]
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
             <div className="border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col">
               <h3 className="text-xs font-semibold text-[#14532d] mb-2 uppercase flex items-center gap-1.5">
                 <LineChartIcon className="w-3.5 h-3.5 text-[#ca8a04]" /> Batter Form Matrix (Avg vs SR)
               </h3>
               <div className="flex-1 min-h-[200px]">
                 {scatterData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#d6c4a8" />
                       <XAxis type="number" dataKey="avg" name="Average" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: '#d6c4a8' }} tickLine={false} label={{ value: 'Batting Average', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#6b7280' }} />
                       <YAxis type="number" dataKey="sr" name="Strike Rate" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                       <ZAxis type="number" dataKey="rating" range={[20, 150]} name="Rating" />
                       <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #b8976a', backgroundColor: '#faf8f3' }} formatter={(value: any, name: string) => [Number(value).toFixed(1), name]} />
                       <Scatter name="Batters" data={scatterData}>
                         {scatterData.map((entry, index) => {
                           const isSelected = selectedPlayer?.id === entry.id;
                           return <Cell key={`cell-${index}`} fill={isSelected ? "#ef4444" : "#166534"} fillOpacity={isSelected ? 1 : 0.5} />;
                         })}
                       </Scatter>
                     </ScatterChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono">NO BATTER DATA LOADED</div>
                 )}
               </div>
            </div>

            <div className="border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col">
               <h3 className="text-xs font-semibold text-[#14532d] mb-2 uppercase flex items-center gap-1.5">
                 <Zap className="w-3.5 h-3.5 text-[#ca8a04]" /> Peak Form Index (Top 15)
               </h3>
               <div className="flex-1 overflow-y-auto pr-2">
                 {topForm.length > 0 ? (
                   <table className="w-full text-left text-xs whitespace-nowrap">
                     <thead className="bg-[#eef5e6] sticky top-0">
                       <tr>
                         <th className="px-2 py-1.5 font-medium text-[#14532d]">Player</th>
                         <th className="px-2 py-1.5 font-medium text-[#14532d] text-right">Avg</th>
                         <th className="px-2 py-1.5 font-medium text-[#14532d] text-right">SR</th>
                         <th className="px-2 py-1.5 font-medium text-[#14532d] text-right">Rating</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-[#d6c4a8]">
                       {topForm.map((p) => {
                         const isSelected = selectedPlayer?.id === p.id;
                         return (
                           <tr key={p.id} className={`${isSelected ? 'bg-[#fef9ee]' : 'hover:bg-[#f0ebe0]'} transition-colors`}>
                             <td className={`px-2 py-1.5 font-medium ${isSelected ? 'text-[#ca8a04]' : 'text-[#0f172a]'}`}>{p.name}</td>
                             <td className="px-2 py-1.5 font-mono text-right text-[#374151]">{p.avg.toFixed(1)}</td>
                             <td className="px-2 py-1.5 font-mono text-right text-[#374151]">{p.sr.toFixed(1)}</td>
                             <td className="px-2 py-1.5 font-mono text-right text-[#166534] font-bold">{p.rating.toFixed(2)}</td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 ) : (
                   <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono text-center px-4">
                     RUN A QUERY IN SCOUTMIND TO POPULATE TARGETS
                   </div>
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
