"use client";

import React, { createContext, useContext, useState, useCallback } from "react";


export type PlayerRole = "BAT" | "PACE" | "SPIN" | "ALL" | "WK-BAT";
export type Module = "scout" | "injury" | "form" | "tactics";

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  age: number;
  avg: number;
  sr: number;
  injuryRisk: number;
  rating: number;
  team: string;
  radarProfile?: number[];
  workloadData?: { month: string; risk: number; workload: number }[];
}


interface AppContextValue {
  players: Player[];
  setPlayers: (players: Player[]) => void;

  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;

  activeDataset: string;
  setActiveDataset: (dataset: string) => void;
  isRefreshing: boolean;

  currentModule: Module;
  setCurrentModule: (module: Module) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}



const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
  return ctx;
}


export function AppProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeDataset, setActiveDatasetRaw] = useState("ICC T20 World Cup");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module>("scout");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const setActiveDataset = useCallback((dataset: string) => {
    setIsRefreshing(true);
    setActiveDatasetRaw(dataset);
    setTimeout(() => setIsRefreshing(false), 900);
  }, []);

  return (
    <AppContext.Provider
      value={{
        players,
        setPlayers,
        selectedPlayer,
        setSelectedPlayer,
        activeDataset,
        setActiveDataset,
        isRefreshing,
        currentModule,
        setCurrentModule,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
