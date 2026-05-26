"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search, Target, Activity, LineChart, Shield,
  Users, ArrowRight, Zap, FileSearch, TrendingUp,
} from "lucide-react";
import { useAppContext } from "@/lib/AppContext";
import { useRouter } from "next/navigation";

interface PaletteAction {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  href?: string;
  keywords: string;
}

const ACTIONS: PaletteAction[] = [
  { id: "a1",  label: "Analyze V. Kohli Form Trajectory",   category: "FormCast",    icon: TrendingUp, href: "/form",    keywords: "kohli form trajectory bat" },
  { id: "a2",  label: "Find Left-Arm Death Bowlers",        category: "ScoutMind",   icon: Target,     href: "/scout",   keywords: "left arm death bowler pace" },
  { id: "a3",  label: "Open InjuryIQ Dashboard",            category: "InjuryIQ",    icon: Activity,   href: "/injury",  keywords: "injury workload acwr dashboard" },
  { id: "a4",  label: "Open FormCast Dashboard",            category: "FormCast",    icon: LineChart,  href: "/form",    keywords: "form cast momentum chart" },
  { id: "a5",  label: "Simulate Powerplay Matchups",        category: "OpponentEdge",icon: Shield,     href: "/tactics", keywords: "powerplay matchup tactics simulate" },
  { id: "a6",  label: "Search Injury Data — Pacers May",    category: "InjuryIQ",    icon: FileSearch, href: "/injury",  keywords: "injury pacer may risk search" },
  { id: "a7",  label: "Run ACWR Report — Fast Bowlers",     category: "InjuryIQ",    icon: Activity,   href: "/injury",  keywords: "acwr workload report fast bowler run" },
  { id: "a8",  label: "IPL Auction Pool '26 — Top Targets", category: "ScoutMind",   icon: Users,      href: "/scout",   keywords: "ipl auction pool target scout" },
  { id: "a9",  label: "Generate Spin Vulnerability Report", category: "OpponentEdge",icon: Shield,     href: "/tactics", keywords: "spin vulnerability report tactics" },
  { id: "a10", label: "Compare J. Bumrah vs. P. Cummins",  category: "ScoutMind",   icon: Zap,        href: "/scout",   keywords: "bumrah cummins compare pace bowler" },
];

const CATEGORY_COLORS: Record<string, string> = {
  ScoutMind:    "text-[#3b82f6] bg-[#dbeafe]",
  InjuryIQ:     "text-[#ef4444] bg-[#fee2e2]",
  FormCast:     "text-[#22c55e] bg-[#dcfce7]",
  OpponentEdge: "text-[#8b5cf6] bg-[#ede9fe]",
};

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppContext();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const filtered = query.trim()
    ? ACTIONS.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.keywords.includes(query.toLowerCase())
      )
    : ACTIONS;

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const execute = useCallback(
    (action: PaletteAction) => {
      setCommandPaletteOpen(false);
      if (action.href) router.push(action.href);
    },
    [router, setCommandPaletteOpen]
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { setCommandPaletteOpen(false); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (e.key === "Enter" && filtered[cursor]) {
        execute(filtered[cursor]);
      }
    },
    [filtered, cursor, execute, setCommandPaletteOpen]
  );

  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ backgroundColor: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }}
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#cbd5e1] rounded-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#e2e8f0]">
          <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            placeholder="Search actions — 'injury', 'form', 'find bowlers'..."
            className="flex-1 text-sm text-[#0f172a] placeholder-[#94a3b8] bg-transparent outline-none font-mono"
          />
          <kbd className="text-[10px] text-[#94a3b8] border border-[#cbd5e1] rounded px-1.5 py-0.5 font-sans">
            ESC
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-80 overflow-y-auto py-1" role="listbox">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-[#94a3b8] font-mono">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              const isActive = idx === cursor;
              return (
                <li
                  key={action.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => execute(action)}
                  onMouseEnter={() => setCursor(idx)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    isActive ? "bg-[#f1f5f9]" : "hover:bg-[#f8fafc]"
                  }`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-sm flex-shrink-0 ${CATEGORY_COLORS[action.category]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="flex-1 text-sm text-[#0f172a]">{action.label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 ${CATEGORY_COLORS[action.category]}`}>
                    {action.category}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity ${isActive ? "text-[#64748b] opacity-100" : "text-[#cbd5e1] opacity-0"}`} />
                </li>
              );
            })
          )}
        </ul>

        <div className="border-t border-[#e2e8f0] px-3 py-1.5 flex items-center gap-4 text-[10px] text-[#94a3b8] font-mono bg-[#f8fafc]">
          <span><kbd className="border border-[#cbd5e1] rounded px-1 mr-1">↑↓</kbd> navigate</span>
          <span><kbd className="border border-[#cbd5e1] rounded px-1 mr-1">↵</kbd> open</span>
          <span><kbd className="border border-[#cbd5e1] rounded px-1 mr-1">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
