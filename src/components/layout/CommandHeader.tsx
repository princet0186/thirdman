"use client";

import { Search, ChevronRight, Terminal } from "lucide-react";
import { useEffect, useCallback } from "react";
import { useAppContext } from "@/lib/AppContext";
import CommandPalette from "./CommandPalette";

export default function CommandHeader() {
  const { commandPaletteOpen, setCommandPaletteOpen, activeDataset, isRefreshing } = useAppContext();

  const openPalette = useCallback(() => setCommandPaletteOpen(true), [setCommandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  return (
    <>
      <header className="h-10 bg-gradient-to-r from-[#052e16] to-[#14532d] border-b-2 border-[#ca8a04] flex items-center justify-between px-3 flex-shrink-0 z-10">
        <div className="flex items-center text-xs text-[#86efac] font-medium font-mono">
          <span className="text-white">WORKSPACE</span>
          <ChevronRight className="w-3 h-3 mx-1 text-[#ca8a04]" />
          <span className="text-white">SCOUTMIND</span>
          <ChevronRight className="w-3 h-3 mx-1 text-[#ca8a04]" />
          <span
            className={`transition-all duration-300 ${
              isRefreshing ? "text-[#fbbf24] animate-pulse" : "text-[#86efac]"
            }`}
          >
            {isRefreshing ? "REFRESHING..." : activeDataset.toUpperCase().replace(/[' ]/g, "_")}
          </span>
        </div>

        <div className="flex-1 max-w-2xl px-6 flex justify-center">
          <button
            id="command-palette-trigger"
            onClick={openPalette}
            className="relative w-full group flex items-center text-left"
          >
            <div className="absolute left-2 flex items-center text-[#86efac]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div
              className={`w-full bg-[#0a3d1e] border text-xs pl-8 pr-16 py-1 rounded-sm text-white transition-all font-mono ${
                commandPaletteOpen
                  ? "border-[#ca8a04] ring-1 ring-[#ca8a04]"
                  : "border-[#166534] hover:border-[#22c55e]"
              }`}
            >
              <span className="text-[#86efac] opacity-60">
                Agent Command &gt; type &apos;find similar players to V. Kohli with low injury risk&apos;...
              </span>
            </div>
            <div className="absolute right-2 flex items-center gap-1">
              <span className="text-[10px] text-[#86efac] border border-[#166534] rounded-sm px-1 font-sans">⌘</span>
              <span className="text-[10px] text-[#86efac] border border-[#166534] rounded-sm px-1 font-sans">K</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#86efac] font-mono">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? "bg-[#fbbf24] animate-pulse" : "bg-[#22c55e]"}`} />
            <span>{isRefreshing ? "SYNCING" : "ELASTIC_SYNC"}</span>
          </div>
          <div className="h-3 w-px bg-[#166534]" />
          <span>USER:S.STAFF</span>
        </div>
      </header>

      <CommandPalette />
    </>
  );
}
