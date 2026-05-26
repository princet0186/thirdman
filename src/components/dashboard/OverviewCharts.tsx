"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const radarData = [
  { subject: 'BAT AVG', A: 85, fullMark: 100 },
  { subject: 'PWR HIT', A: 92, fullMark: 100 },
  { subject: 'SPIN PLAY', A: 78, fullMark: 100 },
  { subject: 'PACE BOWL', A: 35, fullMark: 100 },
  { subject: 'DEATH BOWL', A: 20, fullMark: 100 },
  { subject: 'FIELDING', A: 88, fullMark: 100 },
];

const injuryData = [
  { month: 'W1', risk: 15, workload: 40 },
  { month: 'W2', risk: 18, workload: 55 },
  { month: 'W3', risk: 32, workload: 80 },
  { month: 'W4', risk: 65, workload: 92 },
  { month: 'W5', risk: 40, workload: 70 },
  { month: 'W6', risk: 25, workload: 50 },
];

export default function OverviewCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <div className="text-[10px] font-mono text-[#64748b] mb-2 uppercase flex justify-between">
          <span>Target Profile (Radar)</span>
          <span className="text-[#3b82f6]">ID: CRK-1934</span>
        </div>
        <div className="h-[180px] w-full bg-[#f8fafc] border border-[#e2e8f0] p-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'monospace' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Target Player" dataKey="A" stroke="#3b82f6" strokeWidth={1} fill="#3b82f6" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="text-[10px] font-mono text-[#64748b] mb-2 uppercase flex justify-between">
          <span>InjuryIQ Fast-Bowling Workload</span>
          <span className="text-[#ef4444]">RISK: 65% (W4)</span>
        </div>
        <div className="h-[180px] w-full bg-[#f8fafc] border border-[#e2e8f0] p-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={injuryData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#cbd5e1" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={false} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '2px', fontSize: '10px', fontFamily: 'monospace', padding: '4px' }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }} iconSize={6} />
              <Line yAxisId="left" type="step" dataKey="risk" name="Risk (%)" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="workload" name="ACWR" stroke="#3b82f6" strokeWidth={1} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
