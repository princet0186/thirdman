"use client";

const POSITIONS: Record<string, { x: number; y: number }> = {
  "Wicket Keeper": { x: 200, y: 278 },
  "First Slip": { x: 235, y: 272 },
  "Second Slip": { x: 258, y: 260 },
  "Third Slip": { x: 275, y: 248 },
  "Gully": { x: 285, y: 232 },
  "Leg Slip": { x: 165, y: 272 },
  "Short Leg": { x: 172, y: 225 },
  "Silly Point": { x: 228, y: 225 },
  "Point": { x: 312, y: 215 },
  "Cover": { x: 295, y: 165 },
  "Extra Cover": { x: 268, y: 145 },
  "Mid-off": { x: 238, y: 122 },
  "Mid-on": { x: 162, y: 122 },
  "Mid-wicket": { x: 128, y: 148 },
  "Square Leg": { x: 92, y: 215 },
  "Fine Leg": { x: 105, y: 298 },
  "Third Man": { x: 298, y: 298 },
  "Backward Point": { x: 298, y: 252 },
  "Deep Point": { x: 368, y: 208 },
  "Deep Cover": { x: 350, y: 142 },
  "Long-off": { x: 275, y: 48 },
  "Long-on": { x: 125, y: 48 },
  "Deep Mid-wicket": { x: 55, y: 132 },
  "Deep Square Leg": { x: 32, y: 208 },
  "Cow Corner": { x: 68, y: 72 },
  "Deep Fine Leg": { x: 55, y: 335 },
  "Deep Third Man": { x: 348, y: 335 },
  "Long Leg": { x: 48, y: 305 },
  "Sweeper Cover": { x: 362, y: 168 },
};

interface CricketFieldProps {
  threatName: string;
  counterName: string;
  fieldPositions: string[];
  isBowling: boolean; // true = we are bowling to threat batsman
}

export default function CricketField({ threatName, counterName, fieldPositions, isBowling }: CricketFieldProps) {
  const batsman = { x: 200, y: 238, name: isBowling ? threatName : counterName, color: isBowling ? "#ef4444" : "#3b82f6" };
  const bowler = { x: 200, y: 158, name: isBowling ? counterName : threatName, color: isBowling ? "#3b82f6" : "#ef4444" };

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" style={{ maxHeight: "480px" }}>
      <defs>
        <radialGradient id="fieldGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#2d6a1e" />
          <stop offset="85%" stopColor="#1a472a" />
          <stop offset="100%" stopColor="#0f2d18" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Field oval */}
      <ellipse cx="200" cy="200" rx="190" ry="190" fill="url(#fieldGrad)" stroke="#ca8a04" strokeWidth="3" />

      {/* 30-yard circle */}
      <ellipse cx="200" cy="200" rx="105" ry="105" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="6 4" />

      {/* Pitch */}
      <rect x="191" y="148" width="18" height="100" rx="2" fill="#d4a853" stroke="#b8976a" strokeWidth="1" />

      {/* Crease lines */}
      <line x1="182" y1="158" x2="218" y2="158" stroke="white" strokeWidth="1.5" />
      <line x1="182" y1="238" x2="218" y2="238" stroke="white" strokeWidth="1.5" />

      {/* Stumps */}
      {[196, 200, 204].map(sx => (
        <g key={`s-top-${sx}`}>
          <line x1={sx} y1="155" x2={sx} y2="161" stroke="white" strokeWidth="1.5" />
          <line x1={sx} y1="235" x2={sx} y2="241" stroke="white" strokeWidth="1.5" />
        </g>
      ))}

      {/* Fielder nodes */}
      {fieldPositions.map((pos) => {
        const coord = POSITIONS[pos];
        if (!coord) return null;
        return (
          <g key={pos}>
            <circle cx={coord.x} cy={coord.y} r="8" fill="#22c55e" stroke="white" strokeWidth="1.5" opacity="0.9" />
            <text x={coord.x} y={coord.y + 18} textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace" opacity="0.85">
              {pos}
            </text>
          </g>
        );
      })}

      {/* Batsman node */}
      <g filter="url(#glow)">
        <circle cx={batsman.x} cy={batsman.y} r="12" fill={batsman.color} stroke="white" strokeWidth="2" />
      </g>
      <text x={batsman.x} y={batsman.y + 22} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="monospace">
        {batsman.name}
      </text>

      {/* Bowler node */}
      <g filter="url(#glow)">
        <circle cx={bowler.x} cy={bowler.y} r="12" fill={bowler.color} stroke="white" strokeWidth="2" />
      </g>
      <text x={bowler.x} y={bowler.y - 18} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="monospace">
        {bowler.name}
      </text>

      {/* Legend - vertical in top-left corner */}
      <g transform="translate(18, 22)">
        <circle cx="6" cy="0" r="5" fill="#ef4444" />
        <text x="16" y="4" fill="white" fontSize="8" fontFamily="monospace">Threat</text>
        <circle cx="6" cy="18" r="5" fill="#3b82f6" />
        <text x="16" y="22" fill="white" fontSize="8" fontFamily="monospace">Counter</text>
        <circle cx="6" cy="36" r="5" fill="#22c55e" />
        <text x="16" y="40" fill="white" fontSize="8" fontFamily="monospace">Fielder</text>
      </g>
    </svg>
  );
}
