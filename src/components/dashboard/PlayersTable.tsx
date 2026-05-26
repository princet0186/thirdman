"use client";

import { Filter, Download, MoreHorizontal, Settings2, CheckCircle2, RotateCcw } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useAppContext, type Player } from "@/lib/AppContext";

const ROLE_COLORS: Record<string, string> = {
  BAT: "bg-[#ca8a04]",
  PACE: "bg-[#ef4444]",
  SPIN: "bg-[#166534]",
  ALL: "bg-[#8b5cf6]",
  "WK-BAT": "bg-[#06b6d4]",
};

export default function PlayersTable() {
  const { selectedPlayer, setSelectedPlayer, players, setPlayers } = useAppContext();
  const [exported, setExported] = useState(false);
  const [loading, setLoading] = useState(players.length === 0);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (players.length > 0) return;
      
      try {
        const response = await fetch("http://localhost:8000/api/players");
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players);
          if (data.players.length > 0 && !selectedPlayer) {
            setSelectedPlayer(data.players[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch players", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/players");
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
        if (data.players?.length > 0) {
          setSelectedPlayer(data.players[0]);
        } else {
          setSelectedPlayer(null);
        }
      }
    } catch (error) {
      console.error("Failed to reset players", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(players, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thirdman_targets_export.json";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }, [players]);

  return (
    <div className="flex flex-col h-full bg-[#faf8f3]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#d6c4a8] bg-[#f5f0e8]">
        <div className="flex gap-2">
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#166534] bg-[#eef5e6] border border-[#86efac] rounded-sm hover:bg-[#dcfce7] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            RESET TARGETS
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#374151] bg-[#faf8f3] border border-[#d6c4a8] rounded-sm hover:bg-[#f0ebe0] transition-colors">
            <Filter className="w-3 h-3" />
            FILTER [Active: IPL 2026]
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#374151] bg-[#faf8f3] border border-[#d6c4a8] rounded-sm hover:bg-[#f0ebe0] transition-colors">
            <Settings2 className="w-3 h-3" />
            COLUMNS
          </button>
        </div>
        <div className="flex gap-2">
          <button
            id="export-json-btn"
            onClick={handleExport}
            className={`flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-sm border transition-all duration-300 ${exported
              ? "bg-[#eef5e6] border-[#86efac] text-[#166534]"
              : "bg-[#faf8f3] border-[#d6c4a8] text-[#374151] hover:bg-[#f0ebe0]"
              }`}
          >
            {exported ? (
              <><CheckCircle2 className="w-3 h-3" />EXPORTED</>
            ) : (
              <><Download className="w-3 h-3" />EXPORT JSON</>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-[#eef5e6] z-10">
            <tr className="text-[10px] font-semibold text-[#14532d] uppercase tracking-wider border-b-2 border-[#ca8a04]">
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
          <tbody className="text-[12px] divide-y divide-[#d6c4a8]">
            {loading ? (
              <tr>
                <td colSpan={10} className="px-3 py-4 text-center text-[#b8976a] text-xs font-mono">
                  LOADING PLAYERS FROM ELASTICSEARCH...
                </td>
              </tr>
            ) : players.map((player) => {
              const isSelected = selectedPlayer?.id === player.id;
              return (
                <tr
                  key={player.id}
                  id={`player-row-${player.id}`}
                  onClick={() => setSelectedPlayer(isSelected ? null : player)}
                  className={`transition-colors cursor-pointer group ${isSelected
                    ? "bg-[#fef9ee] border-l-2 border-l-[#ca8a04]"
                    : "hover:bg-[#f0ebe0] border-l-2 border-l-transparent"
                    }`}
                >
                  <td className="px-3 py-1.5 text-[#b8976a] font-mono text-[10px]">{player.id}</td>
                  <td className={`px-3 py-1.5 font-medium ${isSelected ? "text-[#ca8a04]" : "text-[#0f172a]"}`}>
                    {player.name}
                    {isSelected && (
                      <span className="ml-1.5 text-[9px] font-mono text-[#92400e] bg-[#fef3c7] px-1 py-0.5 rounded-sm border border-[#fcd34d]">
                        SELECTED
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-[#374151]">{player.team}</td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-medium text-white ${ROLE_COLORS[player.role] ?? "bg-[#8b5cf6]"}`}>
                      {player.role}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-[#374151]">{player.age}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-[#374151]">{player.avg.toFixed(1)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-[#374151]">{player.sr.toFixed(1)}</td>
                  <td className="px-3 py-1.5 text-right">
                    <span className={`font-mono text-[11px] ${player.injuryRisk < 20 ? "text-[#16a34a]" :
                      player.injuryRisk < 50 ? "text-[#eab308]" :
                        "text-[#ef4444] font-bold"
                      }`}>
                      {player.injuryRisk}%
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold text-[#0f172a]">
                    {player.rating.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <button
                      className="text-[#b8976a] hover:text-[#0f172a] opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-2 border-t border-[#d6c4a8] bg-[#f5f0e8] text-[10px] text-[#6b7280] flex justify-between items-center font-mono">
        <span>
          DATASET: {players.length} PLAYERS
          {selectedPlayer && (
            <span className="ml-3 text-[#ca8a04]">
              ● TARGET: {selectedPlayer.name} [{selectedPlayer.id}]
            </span>
          )}
        </span>
        <div className="flex gap-1 font-sans">
          <button className="px-2 py-0.5 border border-[#d6c4a8] rounded-sm bg-[#faf8f3] text-[#b8976a]" disabled>PREV</button>
          <button className="px-2 py-0.5 border border-[#d6c4a8] rounded-sm bg-[#faf8f3] hover:bg-[#f0ebe0] text-[#374151]">NEXT</button>
        </div>
      </div>
    </div>
  );
}
