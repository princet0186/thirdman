"use client";

import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import ResizableLayout from "@/components/layout/ResizableLayout";
import { AlertCircle, Activity, HeartPulse } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAppContext } from "@/lib/AppContext";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, ReferenceLine } from "recharts";

export default function InjuryPage() {
  const { setCurrentModule, players, selectedPlayer, injuryThresholds, setPendingQuery } = useAppContext();

  useEffect(() => {
    setCurrentModule("injury");
  }, [setCurrentModule]);

  const stats = useMemo(() => {
    let low = 0, medium = 0, high = 0;
    const highRiskPlayers: any[] = [];
    
    players.forEach(p => {
      if (p.injuryRisk <= injuryThresholds.green) {
        low++;
      } else if (p.injuryRisk <= injuryThresholds.amber) {
        medium++;
      } else {
        high++;
        highRiskPlayers.push({ ...p });
      }
    });

    highRiskPlayers.sort((a, b) => b.injuryRisk - a.injuryRisk);

    highRiskPlayers.forEach(hrp => {
      const safeReplacements = players.filter(p => 
        p.id !== hrp.id && 
        p.role === hrp.role && 
        p.injuryRisk <= injuryThresholds.green
      ).sort((a, b) => b.rating - a.rating);
      
      if (safeReplacements.length > 0) {
        hrp.aiReplacement = safeReplacements[0];
      }
    });

    return { low, medium, high, highRiskPlayers };
  }, [players, injuryThresholds]);

  const scatterData = players.map(p => ({
    name: p.name,
    age: p.age,
    risk: p.injuryRisk,
    role: p.role,
    id: p.id
  }));

  const getRiskColor = (risk: number) => {
    if (risk <= injuryThresholds.green) return "#166534"; // Grass Green
    if (risk <= injuryThresholds.amber) return "#ca8a04"; // Golden Amber
    return "#ef4444"; // Red
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#faf8f3] border border-[#b8976a] p-2 rounded-sm shadow-md text-xs font-mono">
          <div className="font-bold text-[#14532d] mb-1 pb-1 border-b border-[#d6c4a8]">{data.name}</div>
          <div className="text-[#374151]">Age: {data.age}</div>
          <div className="text-[#ef4444] font-bold">Risk: {data.risk}%</div>
        </div>
      );
    }
    return null;
  };

  const centerContent = (
    <div className="bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md p-3 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ef4444]" />
            Squad Workload & Injury Risk Dashboard
          </h2>
          <p className="text-xs text-[#6b7280] mt-1">
            Dynamic risk analysis synced to Workspace Settings (Green: &lt;{injuryThresholds.green}%, Amber: &lt;{injuryThresholds.amber}%).
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#ef4444] bg-[#fef2f2] px-2 py-1 rounded-sm border border-[#fca5a5]">
            {stats.high} PLAYERS AT CRITICAL RISK
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-3 border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col min-h-0">
           <h3 className="text-xs font-semibold text-[#14532d] mb-4 uppercase">Age vs Injury Risk Profiler</h3>
           <div className="flex-1 min-h-[200px]">
             {scatterData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#d6c4a8" />
                   <XAxis 
                     type="number" 
                     dataKey="age" 
                     name="Age" 
                     domain={['dataMin - 1', 'dataMax + 1']} 
                     tick={{ fontSize: 10, fill: "#6b7280" }} 
                     axisLine={{ stroke: '#d6c4a8' }} 
                     tickLine={false} 
                     label={{ value: 'Player Age', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#6b7280' }} 
                   />
                   <YAxis 
                     type="number" 
                     dataKey="risk" 
                     name="Risk %" 
                     domain={[0, 100]} 
                     tick={{ fontSize: 10, fill: "#6b7280" }} 
                     axisLine={false} 
                     tickLine={false} 
                   />
                   
                   {/* Configurable Threshold Reference Lines */}
                   <ReferenceLine y={injuryThresholds.green} stroke="#166534" strokeDasharray="4 4" opacity={0.6} label={{ position: 'top', value: 'GREEN ZONE LIMIT', fill: '#166534', fontSize: 9, fontFamily: 'monospace' }} />
                   <ReferenceLine y={injuryThresholds.amber} stroke="#ca8a04" strokeDasharray="4 4" opacity={0.6} label={{ position: 'top', value: 'AMBER ZONE LIMIT', fill: '#ca8a04', fontSize: 9, fontFamily: 'monospace' }} />

                   <RechartsTooltip 
                     cursor={{ strokeDasharray: '3 3' }} 
                     content={<CustomTooltip />}
                   />
                   <Scatter name="Players" data={scatterData}>
                     {scatterData.map((entry, index) => {
                       const isSelected = selectedPlayer?.id === entry.id;
                       return (
                         <Cell 
                           key={`cell-${index}`} 
                           fill={isSelected ? "#8b5cf6" : getRiskColor(entry.risk)} 
                           fillOpacity={isSelected ? 1 : 0.7} 
                           stroke={isSelected ? "#ede9fe" : "none"}
                           strokeWidth={isSelected ? 2 : 0}
                         />
                       );
                     })}
                   </Scatter>
                 </ScatterChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono text-center px-4">
                 RUN A QUERY IN SCOUTMIND TO POPULATE TARGETS
               </div>
             )}
           </div>
        </div>

        <div className="lg:col-span-2 border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col min-h-0">
           <h3 className="text-xs font-semibold text-[#14532d] mb-2 uppercase flex items-center gap-1.5">
             <AlertCircle className="w-3.5 h-3.5 text-[#ef4444]" /> Critical Watchlist
           </h3>
           <p className="text-[10px] text-[#6b7280] mb-3 leading-tight">
             Players exceeding the Amber threshold ({injuryThresholds.amber}%). These targets require medical clearance before bidding.
           </p>
           <div className="flex-1 overflow-y-auto pr-2">
             {stats.highRiskPlayers.length > 0 ? (
               <table className="w-full text-left text-xs whitespace-nowrap">
                 <thead className="bg-[#eef5e6] sticky top-0 z-10 shadow-sm">
                   <tr>
                     <th className="px-2 py-1.5 font-medium text-[#14532d]">Player</th>
                     <th className="px-2 py-1.5 font-medium text-[#14532d]">Role</th>
                     <th className="px-2 py-1.5 font-medium text-[#14532d]">AI Action</th>
                     <th className="px-2 py-1.5 font-medium text-[#14532d] text-right">Risk %</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#d6c4a8]">
                   {stats.highRiskPlayers.map((p: any) => (
                     <tr key={p.id} className="hover:bg-[#f0ebe0] transition-colors">
                       <td className="px-2 py-1.5 font-medium text-[#0f172a]">{p.name}</td>
                       <td className="px-2 py-1.5 text-[#6b7280]">{p.role}</td>
                       <td className="px-2 py-1.5">
                         {p.aiReplacement ? (
                           <button 
                             onClick={() => setPendingQuery(`Develop a medical and tactical strategy to safely swap out ${p.name} (Risk: ${p.injuryRisk}%) with ${p.aiReplacement.name} (Risk: ${p.aiReplacement.injuryRisk}%).`)}
                             className="flex items-center gap-1.5 text-[#166534] bg-[#eef5e6] px-1.5 py-0.5 rounded-sm border border-[#86efac] w-max text-[10px] hover:bg-[#dcfce7] hover:border-[#166534] transition-colors cursor-pointer"
                           >
                             <Activity className="w-3 h-3" />
                             <span>Swap: <b>{p.aiReplacement.name}</b></span>
                           </button>
                         ) : (
                           <span className="text-[#b8976a] text-[10px] uppercase font-mono">No safe swap</span>
                         )}
                       </td>
                       <td className="px-2 py-1.5 font-mono text-right text-[#ef4444] font-bold">{p.injuryRisk}%</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-xs text-[#166534] font-mono gap-2 text-center">
                 <HeartPulse className="w-6 h-6 opacity-50" />
                 SQUAD HEALTH OPTIMAL.<br/>NO CRITICAL RISKS DETECTED.
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <ResizableLayout
      storageKey="injury"
      leftTitle="InjuryIQ Context"
      left={<ContextTree />}
      right={<AIPanel />}
      center={centerContent}
    />
  );
}
