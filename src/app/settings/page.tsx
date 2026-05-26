"use client";

import { useAppContext } from "@/lib/AppContext";
import { Settings, Shield, Activity, Target, SlidersHorizontal, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { 
    homeTeam, setHomeTeam, 
    recencyBias, setRecencyBias, 
    metricWeight, setMetricWeight, 
    injuryThresholds, setInjuryThresholds 
  } = useAppContext();

  // Local state for immediate UI updates before "saving"
  const [localHomeTeam, setLocalHomeTeam] = useState(homeTeam);
  const [localRecencyBias, setLocalRecencyBias] = useState(recencyBias);
  const [localMetricWeight, setLocalMetricWeight] = useState(metricWeight);
  const [localGreenThresh, setLocalGreenThresh] = useState(injuryThresholds.green);
  const [localAmberThresh, setLocalAmberThresh] = useState(injuryThresholds.amber);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // We do not set the module so the side nav just un-highlights the active module
  }, []);

  const handleSave = () => {
    setHomeTeam(localHomeTeam);
    setRecencyBias(localRecencyBias);
    setMetricWeight(localMetricWeight);
    setInjuryThresholds({ green: localGreenThresh, amber: localAmberThresh });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
      <div className="bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md p-6">
        <div className="flex items-center justify-between border-b-2 border-[#d6c4a8] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#14532d] p-2 rounded-sm border border-[#ca8a04]">
              <Settings className="w-5 h-5 text-[#ca8a04]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#052e16]">Workspace Configuration</h1>
              <p className="text-sm text-[#b8976a] font-mono mt-0.5">THIRD_MAN // SETTINGS_MODULE</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm font-semibold transition-all duration-300 ${
              saved 
                ? "bg-[#eef5e6] text-[#166534] border-2 border-[#86efac]" 
                : "bg-[#ca8a04] hover:bg-[#a16207] text-white border-2 border-[#a16207]"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "SAVED SUCCESSFULLY" : "SAVE CONFIGURATION"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scouting Context */}
          <div className="bg-[#f5f0e8] border border-[#d6c4a8] rounded-sm p-5">
            <h2 className="text-sm font-bold text-[#14532d] flex items-center gap-2 mb-4 uppercase">
              <Shield className="w-4 h-4 text-[#ca8a04]" /> Base Franchise / Home Team Context
            </h2>
            <p className="text-xs text-[#6b7280] mb-4">
              Select the franchise you are scouting for. This defines the "home" squad for OpponentEdge Matchups.
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#374151]">Target Franchise/Nation</label>
              <select 
                value={localHomeTeam}
                onChange={(e) => setLocalHomeTeam(e.target.value)}
                className="w-full bg-white border-2 border-[#d6c4a8] rounded-sm text-sm text-[#0f172a] p-2.5 focus:outline-none focus:border-[#ca8a04]"
              >
                <optgroup label="International">
                  <option value="IND">India (IND)</option>
                  <option value="AUS">Australia (AUS)</option>
                  <option value="ENG">England (ENG)</option>
                  <option value="SA">South Africa (SA)</option>
                  <option value="PAK">Pakistan (PAK)</option>
                  <option value="NZ">New Zealand (NZ)</option>
                  <option value="IRE">Ireland (IRE)</option>
                  <option value="ZIM">Zimbabwe (ZIM)</option>
                  <option value="UAE">UAE (UAE)</option>
                  <option value="MAS">Malaysia (MAS)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* FormCast Weights */}
          <div className="bg-[#f5f0e8] border border-[#d6c4a8] rounded-sm p-5">
            <h2 className="text-sm font-bold text-[#14532d] flex items-center gap-2 mb-4 uppercase">
              <Target className="w-4 h-4 text-[#ca8a04]" /> FormCast Weightings
            </h2>
            <p className="text-xs text-[#6b7280] mb-4">
              Configure how the Peak Form Index calculates overall player ratings.
            </p>
            
            <div className="space-y-5">
              <div>
                <label className="flex justify-between text-xs font-semibold text-[#374151] mb-2">
                  <span>Recency Bias (Last 5 matches vs Career)</span>
                  <span className="font-mono text-[#ca8a04]">{localRecencyBias}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={localRecencyBias}
                  onChange={(e) => setLocalRecencyBias(Number(e.target.value))}
                  className="w-full h-2 bg-[#d6c4a8] rounded-lg appearance-none cursor-pointer accent-[#166534]"
                />
                <div className="flex justify-between text-[10px] text-[#b8976a] mt-1 font-mono">
                  <span>0% (Career)</span>
                  <span>100% (Recent Form)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Metric Priority Focus</label>
                <div className="flex gap-2">
                  {[
                    { id: "avg_focused", label: "Average Priority" },
                    { id: "balanced", label: "Balanced (Default)" },
                    { id: "sr_focused", label: "Strike Rate Priority" }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setLocalMetricWeight(btn.id as any)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-sm border transition-all ${
                        localMetricWeight === btn.id 
                          ? "bg-[#14532d] text-white border-[#052e16]" 
                          : "bg-white text-[#374151] border-[#d6c4a8] hover:bg-[#faf8f3]"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* InjuryIQ Limits */}
          <div className="bg-[#f5f0e8] border border-[#d6c4a8] rounded-sm p-5 lg:col-span-2">
            <h2 className="text-sm font-bold text-[#14532d] flex items-center gap-2 mb-4 uppercase">
              <Activity className="w-4 h-4 text-[#ca8a04]" /> InjuryIQ Alert Thresholds
            </h2>
            <p className="text-xs text-[#6b7280] mb-4">
              Define the boundaries for the Squad Workload Risk visualizer.
            </p>
            
            <div className="flex items-center gap-6 p-4 bg-white border border-[#d6c4a8] rounded-sm">
              <div className="flex-1">
                <label className="block text-xs font-bold text-[#166534] mb-1">Green Zone (Max)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={localGreenThresh}
                    onChange={(e) => setLocalGreenThresh(Number(e.target.value))}
                    className="w-20 bg-[#f8fafc] border border-[#d6c4a8] rounded-sm p-1.5 text-center font-mono text-sm focus:border-[#166534] focus:outline-none"
                  />
                  <span className="text-[#6b7280] font-mono text-xs">%</span>
                </div>
              </div>

              <SlidersHorizontal className="w-6 h-6 text-[#d6c4a8]" />

              <div className="flex-1">
                <label className="block text-xs font-bold text-[#ca8a04] mb-1">Amber Zone (Max)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={localAmberThresh}
                    onChange={(e) => setLocalAmberThresh(Number(e.target.value))}
                    className="w-20 bg-[#f8fafc] border border-[#d6c4a8] rounded-sm p-1.5 text-center font-mono text-sm focus:border-[#ca8a04] focus:outline-none"
                  />
                  <span className="text-[#6b7280] font-mono text-xs">%</span>
                </div>
              </div>

              <SlidersHorizontal className="w-6 h-6 text-[#d6c4a8]" />

              <div className="flex-1">
                <label className="block text-xs font-bold text-[#ef4444] mb-1">Red Zone (Starts At)</label>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-[#fef2f2] border border-[#fca5a5] text-[#ef4444] rounded-sm p-1.5 text-center font-mono text-sm">
                    &gt; {localAmberThresh}
                  </div>
                  <span className="text-[#6b7280] font-mono text-xs">%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#eef5e6] border-l-4 border-[#166534] rounded-r-sm text-xs text-[#14532d] flex items-center gap-2 font-mono">
              <Shield className="w-4 h-4" />
              <span>NOTE: Any player exceeding the Amber Zone max ({localAmberThresh}%) will trigger critical alerts in ScoutMind.</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
