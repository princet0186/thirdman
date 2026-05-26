"use client";

import {
  ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useMemo } from "react";
import { useAppContext } from "@/lib/AppContext";

const SUBJECTS = ["BAT AVG", "PWR HIT", "SPIN PLAY", "PACE BOWL", "DEATH BOWL", "FIELDING"];

const FALLBACK_RADAR = [50, 50, 50, 50, 50, 50];
const FALLBACK_WORKLOAD = [
  { month: "W1", risk: 0, workload: 0 },
  { month: "W2", risk: 0, workload: 0 },
  { month: "W3", risk: 0, workload: 0 },
  { month: "W4", risk: 0, workload: 0 },
  { month: "W5", risk: 0, workload: 0 },
  { month: "W6", risk: 0, workload: 0 },
];

export default function OverviewCharts() {
  const { selectedPlayer } = useAppContext();

  const radarData = useMemo(() => {
    const profile = selectedPlayer?.radarProfile ?? FALLBACK_RADAR;
    return SUBJECTS.map((subject, i) => ({ subject, A: profile[i] ?? 0, fullMark: 100 }));
  }, [selectedPlayer]);

  const workloadData = selectedPlayer?.workloadData ?? FALLBACK_WORKLOAD;

  const peakRisk = workloadData.length > 0 ? Math.max(...workloadData.map((d) => d.risk)) : 0;
  const peakWeek = workloadData.find((d) => d.risk === peakRisk)?.month ?? "W?";
  const riskColor = peakRisk >= 50 ? "#ef4444" : peakRisk >= 25 ? "#eab308" : "#16a34a";

  const playerLabel = selectedPlayer ? selectedPlayer.name : "Select a player";

  if (!selectedPlayer) {
    return (
      <div className="flex items-center justify-center h-full text-[#b8976a] text-xs font-mono uppercase">
        Select a player to view analytics
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <div className="text-[10px] font-mono text-[#6b7280] mb-2 uppercase flex justify-between items-center">
          <span>Target Profile (Radar)</span>
          <span className="text-[#ca8a04] transition-all duration-300" style={{ opacity: 1 }}>
            ID: {selectedPlayer.id}
          </span>
        </div>
        <div className="h-[180px] w-full bg-[#faf8f3] border border-[#d6c4a8] p-1 transition-all duration-300 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#d6c4a8" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#374151", fontSize: 9, fontFamily: "monospace" }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name={playerLabel}
                dataKey="A"
                stroke="#166534"
                strokeWidth={1.5}
                fill="#166534"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-[10px] font-mono text-[#6b7280] mb-2 uppercase flex justify-between items-center">
          <span>InjuryIQ Fast-Bowling Workload</span>
          <span className="font-mono transition-all duration-300" style={{ color: riskColor }}>
            RISK: {peakRisk}% ({peakWeek})
          </span>
        </div>
        <div className="h-[180px] w-full bg-[#faf8f3] border border-[#d6c4a8] p-1 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={workloadData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#d6c4a8" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "monospace" }}
                axisLine={{ stroke: "#d6c4a8" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis yAxisId="right" orientation="right" tick={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#faf8f3",
                  borderColor: "#b8976a",
                  borderRadius: "2px",
                  fontSize: "10px",
                  fontFamily: "monospace",
                  padding: "4px",
                }}
                itemStyle={{ color: "#0f172a" }}
              />
              <Legend wrapperStyle={{ fontSize: "9px", fontFamily: "monospace" }} iconSize={6} />
              <Line yAxisId="left"  type="step"     dataKey="risk"     name="Risk (%)" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="workload" name="ACWR"     stroke="#166534" strokeWidth={1}   dot={false}    strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
