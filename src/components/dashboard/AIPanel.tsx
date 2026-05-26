"use client";

import { Sparkles, Terminal, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/lib/AppContext";

interface AIResponse {
  reasoning: string;
  steps: string[];
  actions: string[];
  insights?: string;
}

export default function AIPanel() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const { setSelectedPlayer, setPlayers, players } = useAppContext();

  const handleInsightsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === "b") {
      const clickedName = target.innerText.trim().toLowerCase();
      const matchedPlayer = players.find(p => 
        p.name.toLowerCase().includes(clickedName) || 
        clickedName.includes(p.name.toLowerCase())
      );
      if (matchedPlayer) {
        setSelectedPlayer(matchedPlayer);
      }
    }
  };

  const handleQuery = async (overrideQuery?: string) => {
    const queryToRun = overrideQuery || query;
    if (!queryToRun.trim()) return;
    
    if (overrideQuery) setQuery(overrideQuery);
    
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToRun }),
      });
      const data = await res.json();
      setResponse(data.ai);
      
      if (data.players && data.players.length > 0) {
        setPlayers(data.players);
        setSelectedPlayer(data.players[0]);
      } else if (data.players) {
        setPlayers([]);
        setSelectedPlayer(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#faf8f3]">
      <div className="h-8 border-b-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534] flex items-center px-3 justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#ca8a04]" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Agent Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#22c55e] bg-[#052e16] px-1.5 rounded-sm border border-[#166534]">ONLINE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {response ? (
          <>
            {response.insights && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#b8976a]">SYS // PLAYER_INSIGHTS</div>
                <div 
                  onClick={handleInsightsClick}
                  className="bg-white border border-[#d6c4a8] p-2 rounded-sm text-xs text-[#374151] shadow-sm font-sans leading-relaxed [&_b]:text-[#166534] [&_b]:font-bold [&_b]:cursor-pointer hover:[&_b]:underline"
                  dangerouslySetInnerHTML={{ __html: response.insights }}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#b8976a]">RECOMMENDED_ACTIONS</div>
              <div className="space-y-1">
                {response.actions.map((action, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleQuery(action)}
                    className="w-full flex items-center justify-between text-left text-xs bg-white border border-[#d6c4a8] hover:border-[#ca8a04] hover:bg-[#fef9ee] transition-colors p-2 rounded-sm text-[#0f172a]"
                  >
                    <span>{action}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#b8976a]" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#b8976a] text-xs font-mono uppercase">
            Awaiting instructions...
          </div>
        )}
      </div>

      <div className="p-3 border-t-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534]">
        <div className="text-[10px] font-mono text-[#86efac] mb-1">TERMINAL // INPUT</div>
        <div className="relative">
          <textarea 
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuery();
              }
            }}
            disabled={isLoading}
            className="w-full bg-[#0a3d1e] border border-[#166534] rounded-sm text-xs text-white p-2 focus:outline-none focus:border-[#ca8a04] focus:ring-1 focus:ring-[#ca8a04] resize-none font-mono placeholder:text-[#86efac] placeholder:opacity-50"
            placeholder="Instruct the agent... (e.g. Find left arm spinners with risk < 30%)"
          ></textarea>
          <button 
            onClick={() => handleQuery()}
            disabled={isLoading}
            className="absolute bottom-2 right-2 bg-[#ca8a04] text-white p-1 rounded-sm hover:bg-[#a16207] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
