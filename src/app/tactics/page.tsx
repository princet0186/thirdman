"use client";

import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import CricketField from "@/components/tactics/CricketField";
import { Shield, Crosshair, Users, Swords, Zap, Loader2, X, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext, Player } from "@/lib/AppContext";

interface CounterStrategy {
  counter_player: string;
  approach: string;
  summary: string;
  field_positions: string[];
  key_tactics: string[];
}

export default function TacticsPage() {
  const { setCurrentModule, homeTeam, setPendingQuery } = useAppContext();

  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<string>("");
  const [homeSquad, setHomeSquad] = useState<Player[]>([]);
  const [opponentSquad, setOpponentSquad] = useState<Player[]>([]);
  const [loadingHome, setLoadingHome] = useState(false);
  const [loadingOpponent, setLoadingOpponent] = useState(false);

  // Neutralize modal state
  const [selectedThreat, setSelectedThreat] = useState<Player | null>(null);
  const [counterStrategy, setCounterStrategy] = useState<CounterStrategy | null>(null);
  const [loadingCounter, setLoadingCounter] = useState(false);

  useEffect(() => {
    setCurrentModule("tactics");
    fetch("http://localhost:8000/api/teams")
      .then(res => res.json())
      .then(data => {
        const teams: string[] = data.teams || [];
        setAllTeams(teams);
        const first = teams.find(t => t !== homeTeam);
        if (first) setOpponentTeam(first);
      })
      .catch(console.error);
  }, [setCurrentModule]);

  useEffect(() => {
    if (!homeTeam) return;
    setLoadingHome(true);
    fetch(`http://localhost:8000/api/players/team/${homeTeam}`)
      .then(res => res.json())
      .then(data => setHomeSquad(data.players || []))
      .catch(console.error)
      .finally(() => setLoadingHome(false));
  }, [homeTeam]);

  useEffect(() => {
    if (!opponentTeam) return;
    setLoadingOpponent(true);
    fetch(`http://localhost:8000/api/players/team/${opponentTeam}`)
      .then(res => res.json())
      .then(data => setOpponentSquad(data.players || []))
      .catch(console.error)
      .finally(() => setLoadingOpponent(false));
  }, [opponentTeam]);

  const opponentOptions = allTeams.filter(t => t !== homeTeam);

  const getCacheKey = (playerId: string) => `tm_counter_${homeTeam}_${playerId}`;

  const handleNeutralize = async (threat: Player) => {
    setSelectedThreat(threat);
    setCounterStrategy(null);

    // Check localStorage cache first
    const cacheKey = getCacheKey(threat.id);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setCounterStrategy(JSON.parse(cached));
        return; // Cache hit — skip API call entirely
      }
    } catch {}

    setLoadingCounter(true);
    try {
      const res = await fetch("http://localhost:8000/api/tactics/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threat, home_squad: homeSquad }),
      });
      const data = await res.json();
      setCounterStrategy(data);
      // Persist to localStorage
      try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
    } catch (err) {
      console.error(err);
      setCounterStrategy({
        counter_player: "N/A", approach: "Error", summary: "Failed to generate strategy.",
        field_positions: ["Wicket Keeper","First Slip","Gully","Point","Cover","Mid-off","Mid-on","Square Leg","Fine Leg"],
        key_tactics: ["Please try again."],
      });
    } finally {
      setLoadingCounter(false);
    }
  };

  const handleGenerateStrategy = () => {
    if (!opponentTeam || homeSquad.length === 0) return;
    const homeSummary = homeSquad.slice(0, 15).map(p =>
      `${p.name} (${p.role}, Avg ${p.avg}, SR ${p.sr}, Risk ${p.injuryRisk}%, Rating ${p.rating})`
    ).join("\n");
    const oppSummary = opponentSquad.slice(0, 10).map(p =>
      `${p.name} (${p.role}, Avg ${p.avg}, SR ${p.sr}, Rating ${p.rating})`
    ).join("\n");
    setPendingQuery(`Head Coach of ${homeTeam} vs ${opponentTeam}.\n\nOUR SQUAD:\n${homeSummary}\n\nOPPONENT:\n${oppSummary}\n\nBuild Playing XI, batting order, key threats, bat/bowl first recommendation, and who to drop.`);
  };

  const isBatThreat = selectedThreat && ["BAT", "ALL", "WK-BAT"].includes(selectedThreat.role);

  return (
    <div className="h-full flex gap-2">
      <div className="w-64 bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md overflow-hidden">
        <div className="h-8 border-b-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center px-3 text-xs font-semibold text-white uppercase tracking-wider">
          OpponentEdge Context
        </div>
        <div className="flex-1 overflow-y-auto"><ContextTree /></div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-0">
        <div className="bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md p-3 flex-1 flex flex-col min-h-0">

          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b-2 border-[#d6c4a8] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ca8a04]" /> OpponentEdge Matchup Workbench
              </h2>
              <p className="text-xs text-[#6b7280] mt-1">Click <b>Neutralize</b> on any threat to see the AI field placement.</p>
            </div>
            <div className="flex items-center gap-3 bg-[#f5f0e8] p-1.5 rounded-sm border border-[#d6c4a8]">
              <div className="text-sm font-bold text-[#14532d] px-2">{homeTeam}</div>
              <Swords className="w-4 h-4 text-[#ef4444]" />
              <select value={opponentTeam} onChange={(e) => setOpponentTeam(e.target.value)}
                className="bg-white border border-[#d6c4a8] text-sm font-bold text-[#0f172a] p-1 rounded-sm focus:outline-none focus:border-[#ca8a04]">
                <option value="" disabled>Select opponent...</option>
                {opponentOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={handleGenerateStrategy} disabled={homeSquad.length === 0 || !opponentTeam}
                className="ml-2 flex items-center gap-1.5 bg-[#14532d] hover:bg-[#166534] text-white px-3 py-1.5 rounded-sm text-xs font-bold transition-colors disabled:opacity-40">
                <Zap className="w-3.5 h-3.5 text-[#ca8a04]" /> AI STRATEGY
              </button>
            </div>
          </div>

          {/* Two-column squad comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Home Squad */}
            <div className="border border-[#d6c4a8] rounded bg-[#faf8f3] p-3 flex flex-col min-h-0">
              <h3 className="text-xs font-semibold text-[#14532d] mb-2 uppercase flex items-center gap-1.5 border-b border-[#d6c4a8] pb-2">
                <Users className="w-3.5 h-3.5 text-[#ca8a04]" /> {homeTeam} Squad ({homeSquad.length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1 mt-1">
                {loadingHome ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 text-[#166534] animate-spin" /></div>
                ) : homeSquad.length > 0 ? (
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#eef5e6] sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-2 py-1 font-medium text-[#14532d]">Player</th>
                        <th className="px-2 py-1 font-medium text-[#14532d]">Role</th>
                        <th className="px-2 py-1 font-medium text-[#14532d] text-right">Rating</th>
                        <th className="px-2 py-1 font-medium text-[#14532d] text-right">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d6c4a8]">
                      {homeSquad.map(p => (
                        <tr key={p.id} className="hover:bg-[#f0ebe0] transition-colors">
                          <td className="px-2 py-1 font-medium text-[#0f172a]">{p.name}</td>
                          <td className="px-2 py-1 text-[#6b7280]">{p.role}</td>
                          <td className="px-2 py-1 font-mono text-right text-[#166534]">{p.rating.toFixed(1)}</td>
                          <td className={`px-2 py-1 font-mono text-right font-bold ${p.injuryRisk > 60 ? 'text-[#ef4444]' : p.injuryRisk > 30 ? 'text-[#ca8a04]' : 'text-[#166534]'}`}>{p.injuryRisk}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#b8976a] font-mono text-center p-4">No players for {homeTeam}.</div>
                )}
              </div>
            </div>

            {/* Opponent Threats */}
            <div className="border border-[#d6c4a8] rounded bg-[#fef2f2] p-3 flex flex-col min-h-0 border-t-2 border-t-[#ef4444]">
              <h3 className="text-xs font-semibold text-[#ef4444] mb-2 uppercase flex items-center gap-1.5 border-b border-[#fca5a5] pb-2">
                <Crosshair className="w-3.5 h-3.5 text-[#ef4444]" /> {opponentTeam || "Opponent"} Threats ({opponentSquad.length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1 mt-1">
                {loadingOpponent ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 text-[#ef4444] animate-spin" /></div>
                ) : opponentSquad.length > 0 ? (
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#fee2e2] sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-2 py-1 font-medium text-[#991b1b]">Player</th>
                        <th className="px-2 py-1 font-medium text-[#991b1b]">Role</th>
                        <th className="px-2 py-1 font-medium text-[#991b1b] text-right">Rating</th>
                        <th className="px-2 py-1 font-medium text-[#991b1b]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#fca5a5]">
                      {opponentSquad.map(p => (
                        <tr key={p.id} className="hover:bg-[#fecaca] transition-colors">
                          <td className="px-2 py-1 font-medium text-[#7f1d1d]">{p.name}</td>
                          <td className="px-2 py-1 text-[#991b1b]">{p.role}</td>
                          <td className="px-2 py-1 font-mono text-right text-[#ef4444] font-bold">{p.rating.toFixed(1)}</td>
                          <td className="px-2 py-1">
                            <button onClick={() => handleNeutralize(p)}
                              className="flex items-center gap-1 bg-[#7f1d1d] hover:bg-[#991b1b] text-white px-2 py-0.5 rounded-sm text-[10px] font-bold transition-colors">
                              <Target className="w-3 h-3" /> Neutralize
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#ef4444] font-mono p-4 text-center">
                    {opponentTeam ? `Loading ${opponentTeam}...` : "Select an opponent."}
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

      {/* ===== NEUTRALIZE MODAL ===== */}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedThreat(null)}>
          <div className="bg-[#faf8f3] border-2 border-[#ca8a04] rounded-lg shadow-2xl w-[90vw] max-w-[1100px] h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="h-10 bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center justify-between px-4 border-b-2 border-[#ca8a04]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ef4444]" />
                <span className="text-sm font-bold text-white">NEUTRALIZE: {selectedThreat.name}</span>
                <span className="text-[10px] font-mono text-[#86efac] ml-2">({selectedThreat.role} · Avg {selectedThreat.avg} · SR {selectedThreat.sr})</span>
              </div>
              <button onClick={() => setSelectedThreat(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex min-h-0">
              {/* Left panel: Field for batsman threats, batting card for bowler threats */}
              <div className={`w-1/2 p-4 flex items-center justify-center border-r border-[#ca8a04] ${isBatThreat ? 'bg-[#0f2d18]' : 'bg-[#1e1b4b]'}`}>
                {loadingCounter ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#ca8a04] animate-spin" />
                    <span className="text-xs text-[#86efac] font-mono">{isBatThreat ? 'COMPUTING FIELD PLACEMENT...' : 'ANALYZING BOWLING PATTERNS...'}</span>
                  </div>
                ) : counterStrategy ? (
                  isBatThreat ? (
                    <CricketField
                      threatName={selectedThreat.name}
                      counterName={counterStrategy.counter_player}
                      fieldPositions={counterStrategy.field_positions}
                      isBowling={true}
                    />
                  ) : (
                    /* Bowler threat: show batting counter card */
                    <div className="w-full max-w-sm space-y-4 text-center">
                      <div className="text-[10px] font-mono text-[#a5b4fc] uppercase tracking-widest">Batting Counter Plan</div>
                      <div className="bg-[#312e81] border border-[#6366f1] rounded-lg p-6">
                        <div className="text-[10px] font-mono text-[#a5b4fc] mb-1">THREAT BOWLER</div>
                        <div className="text-2xl font-bold text-[#ef4444]">{selectedThreat.name}</div>
                        <div className="text-xs text-[#c7d2fe] mt-1">{selectedThreat.role} · SR {selectedThreat.sr}</div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-[#a5b4fc]">
                        <Swords className="w-5 h-5" />
                        <span className="text-xs font-mono">VS</span>
                        <Swords className="w-5 h-5" />
                      </div>
                      <div className="bg-[#312e81] border border-[#6366f1] rounded-lg p-6">
                        <div className="text-[10px] font-mono text-[#a5b4fc] mb-1">OUR BATSMAN</div>
                        <div className="text-2xl font-bold text-[#3b82f6]">{counterStrategy.counter_player}</div>
                        <div className="text-xs text-[#c7d2fe] mt-2 italic">{counterStrategy.approach}</div>
                      </div>
                    </div>
                  )
                ) : null}
              </div>

              {/* Right: Strategy Text */}
              <div className="w-1/2 p-4 overflow-y-auto flex flex-col gap-4">
                {loadingCounter ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#b8976a] font-mono">GENERATING TACTICAL ANALYSIS...</div>
                ) : counterStrategy ? (
                  <>
                    <div className="bg-white border border-[#d6c4a8] rounded-sm p-3">
                      <div className="text-[10px] font-mono text-[#b8976a] mb-1">COUNTER PLAYER</div>
                      <div className="text-lg font-bold text-[#14532d]">{counterStrategy.counter_player}</div>
                      <div className="text-xs text-[#6b7280] mt-1 italic">{counterStrategy.approach}</div>
                    </div>
                    <div className="bg-white border border-[#d6c4a8] rounded-sm p-3">
                      <div className="text-[10px] font-mono text-[#b8976a] mb-1">TACTICAL SUMMARY</div>
                      <p className="text-sm text-[#374151] leading-relaxed">{counterStrategy.summary}</p>
                    </div>
                    <div className="bg-white border border-[#d6c4a8] rounded-sm p-3">
                      <div className="text-[10px] font-mono text-[#b8976a] mb-2">KEY TACTICS</div>
                      <ul className="space-y-2">
                        {counterStrategy.key_tactics.map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#374151]">
                            <span className="bg-[#14532d] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i + 1}</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {isBatThreat && counterStrategy.field_positions.length > 0 && (
                      <div className="bg-[#f5f0e8] border border-[#d6c4a8] rounded-sm p-3">
                        <div className="text-[10px] font-mono text-[#b8976a] mb-1">FIELD SETUP ({counterStrategy.field_positions.length} FIELDERS)</div>
                        <div className="flex flex-wrap gap-1">
                          {counterStrategy.field_positions.map(pos => (
                            <span key={pos} className="text-[10px] bg-[#eef5e6] text-[#166534] border border-[#86efac] px-1.5 py-0.5 rounded-sm font-mono">{pos}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
