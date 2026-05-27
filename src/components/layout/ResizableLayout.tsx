"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ResizableLayoutProps {

  left: React.ReactNode;
  leftTitle: string;
  center: React.ReactNode;
  right: React.ReactNode;
  storageKey?: string;
}

const DEFAULTS = { left: 256, right: 340 };
const LIMITS = {
  left: { min: 180, max: 400 },
  right: { min: 280, max: 520 },
};

function loadSizes(key: string) {
  try {
    const raw = localStorage.getItem(`tm_panes_${key}`);
    if (raw) return JSON.parse(raw) as { left: number; right: number };
  } catch { }
  return null;
}

function saveSizes(key: string, sizes: { left: number; right: number }) {
  try {
    localStorage.setItem(`tm_panes_${key}`, JSON.stringify(sizes));
  } catch { }
}

export default function ResizableLayout({
  left,
  leftTitle,
  center,
  right,
  storageKey = "default",
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULTS.left;
    const saved = loadSizes(storageKey);
    return saved?.left ?? DEFAULTS.left;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULTS.right;
    const saved = loadSizes(storageKey);
    return saved?.right ?? DEFAULTS.right;
  });

  const dragging = useRef<"left" | "right" | null>(null);
  const startX = useRef(0);
  const startW = useRef(0);

  const leftRef = useRef(leftWidth);
  const rightRef = useRef(rightWidth);
  useEffect(() => { leftRef.current = leftWidth; }, [leftWidth]);
  useEffect(() => { rightRef.current = rightWidth; }, [rightWidth]);

  const handleMouseDown = useCallback(
    (side: "left" | "right", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = side;
      startX.current = e.clientX;
      startW.current = side === "left" ? leftRef.current : rightRef.current;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    []
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;

      if (dragging.current === "left") {
        const next = Math.max(LIMITS.left.min, Math.min(LIMITS.left.max, startW.current + delta));
        setLeftWidth(next);
      } else {
        const next = Math.max(LIMITS.right.min, Math.min(LIMITS.right.max, startW.current - delta));
        setRightWidth(next);
      }
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      saveSizes(storageKey, { left: leftRef.current, right: rightRef.current });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [storageKey]);

  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);

  const handleStyle: React.CSSProperties = {
    width: 8,
    cursor: "col-resize",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
    zIndex: 10,
    transition: "background-color 0.15s ease",
  };

  const gripStyle = (side: "left" | "right"): React.CSSProperties => ({
    width: 2,
    height: hoverSide === side ? 40 : 28,
    borderRadius: 1,
    backgroundColor: hoverSide === side ? "#ca8a04" : "#d6c4a8",
    transition: "background-color 0.15s ease, height 0.15s ease",
  });

  return (
    <div className="h-full flex">
      <div
        style={{ width: leftWidth, minWidth: LIMITS.left.min, maxWidth: LIMITS.left.max }}
        className="bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md overflow-hidden"
      >
        <div className="h-8 border-b-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center px-3 text-xs font-semibold text-white uppercase tracking-wider">
          {leftTitle}
        </div>
        <div className="flex-1 overflow-y-auto">{left}</div>
      </div>

      <div
        onMouseDown={(e) => handleMouseDown("left", e)}
        onMouseEnter={() => setHoverSide("left")}
        onMouseLeave={() => { if (!dragging.current) setHoverSide(null); }}
        style={{
          ...handleStyle,
          backgroundColor: hoverSide === "left" ? "rgba(202, 138, 4, 0.18)" : "transparent",
        }}
        role="separator"
        aria-orientation="vertical"
      >
        <div style={gripStyle("left")} />
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-0">
        {center}
      </div>

      <div
        onMouseDown={(e) => handleMouseDown("right", e)}
        onMouseEnter={() => setHoverSide("right")}
        onMouseLeave={() => { if (!dragging.current) setHoverSide(null); }}
        style={{
          ...handleStyle,
          backgroundColor: hoverSide === "right" ? "rgba(202, 138, 4, 0.18)" : "transparent",
        }}
        role="separator"
        aria-orientation="vertical"
      >
        <div style={gripStyle("right")} />
      </div>

      <div
        style={{ width: rightWidth, minWidth: LIMITS.right.min, maxWidth: LIMITS.right.max }}
        className="bg-[#faf8f3] border-2 border-[#b8976a] rounded flex flex-col flex-shrink-0 shadow-md"
      >
        {right}
      </div>
    </div>
  );
}

