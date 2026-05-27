"use client";

import OverviewCharts from "@/components/dashboard/OverviewCharts";
import PlayersTable from "@/components/dashboard/PlayersTable";
import AIPanel from "@/components/dashboard/AIPanel";
import ContextTree from "@/components/dashboard/ContextTree";
import ResizableLayout from "@/components/layout/ResizableLayout";
import { useAppContext } from "@/lib/AppContext";
import { useEffect, useState, useRef, useCallback } from "react";

const CHART_DEFAULTS = { height: 260 };
const CHART_LIMITS = { min: 140, max: 450 };

export default function ScoutPage() {
  const { activeDataset, isRefreshing, selectedPlayer, setCurrentModule } = useAppContext();

  useEffect(() => { setCurrentModule("scout"); }, [setCurrentModule]);

  const [chartHeight, setChartHeight] = useState(() => {
    if (typeof window === "undefined") return CHART_DEFAULTS.height;
    try {
      const saved = localStorage.getItem("tm_scout_chart_h");
      if (saved) return Number(saved);
    } catch { }
    return CHART_DEFAULTS.height;
  });

  const hDragging = useRef(false);
  const hStartY = useRef(0);
  const hStartH = useRef(0);
  const chartRef = useRef(chartHeight);
  useEffect(() => { chartRef.current = chartHeight; }, [chartHeight]);

  const [hHover, setHHover] = useState(false);

  const onHMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hDragging.current = true;
    hStartY.current = e.clientY;
    hStartH.current = chartRef.current;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!hDragging.current) return;
      const delta = e.clientY - hStartY.current;
      const next = Math.max(CHART_LIMITS.min, Math.min(CHART_LIMITS.max, hStartH.current + delta));
      setChartHeight(next);
    };
    const onUp = () => {
      if (!hDragging.current) return;
      hDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try { localStorage.setItem("tm_scout_chart_h", String(chartRef.current)); } catch { }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <ResizableLayout
      storageKey="scout"
      leftTitle="ScoutMind Query"
      left={<ContextTree />}
      right={<AIPanel />}
      center={
        <>
          <div
            style={{ height: chartHeight, minHeight: CHART_LIMITS.min, maxHeight: CHART_LIMITS.max }}
            className="bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md p-3 flex-shrink-0 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-[#0f172a]">Target Analytics Workspace</h2>
              <div className="flex gap-2 items-center">
                {isRefreshing && (
                  <span className="px-2 py-0.5 bg-[#fef3c7] border border-[#fcd34d] text-xs font-mono text-[#92400e] rounded-sm animate-pulse">
                    REFRESHING DATA...
                  </span>
                )}
                {selectedPlayer && (
                  <span className="px-2 py-0.5 bg-[#fef9ee] border border-[#ca8a04] text-xs font-mono text-[#92400e] rounded-sm">
                    TARGET: {selectedPlayer.name}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-[#f5f0e8] border border-[#d6c4a8] text-xs font-mono text-[#6b7280] rounded-sm">
                  ROWS: 420
                </span>
                <span className="px-2 py-0.5 bg-[#eef5e6] border border-[#86efac] text-xs font-mono text-[#166534] rounded-sm">
                  DS: {activeDataset.length > 18 ? activeDataset.slice(0, 18) + "…" : activeDataset}
                </span>
              </div>
            </div>
            <OverviewCharts />
          </div>

          <div
            onMouseDown={onHMouseDown}
            onMouseEnter={() => setHHover(true)}
            onMouseLeave={() => { if (!hDragging.current) setHHover(false); }}
            style={{
              height: 6,
              cursor: "row-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              zIndex: 10,
              transition: "background-color 0.15s ease",
              backgroundColor: hHover ? "rgba(202, 138, 4, 0.18)" : "transparent",
            }}
          >
            <div
              style={{
                height: 2,
                width: hHover ? 48 : 32,
                borderRadius: 1,
                backgroundColor: hHover ? "#ca8a04" : "#d6c4a8",
                transition: "all 0.15s ease",
              }}
            />
          </div>

          <div className="flex-1 bg-[#faf8f3] border-2 border-[#b8976a] rounded shadow-md overflow-hidden flex flex-col">
            <PlayersTable />
          </div>
        </>
      }
    />
  );
}
