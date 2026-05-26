"use client";

import { Sparkles, Terminal, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/lib/AppContext";

interface AIResponse {
  reasoning: string;
  steps: string[];
  actions: string[];
}

export default function AIPanel() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const { setSelectedPlayer, setPlayers } = useAppContext();

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
      
      
      // Update global players list and select first one
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
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="h-8 border-b border-[#cbd5e1] bg-white flex items-center px-3 justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wider">Agent Builder</span>
        </div>
        <span className="text-[10px] font-mono text-[#16a34a] bg-[#dcfce7] px-1.5 rounded-sm">ONLINE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {response ? (
          <>
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#64748b]">SYS // REASONING_ENGINE</div>
              <div className="bg-white border border-[#e2e8f0] p-2 rounded-sm text-xs text-[#334155] shadow-sm font-sans leading-relaxed">
                {response.reasoning}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#64748b]">SYS // EXECUTION_STEPS</div>
              <div className="bg-white border border-[#e2e8f0] p-2 rounded-sm shadow-sm space-y-2">
                {response.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-xs text-[#0f172a]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] mt-0.5 flex-shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#64748b]">RECOMMENDED_ACTIONS</div>
              <div className="space-y-1">
                {response.actions.map((action, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleQuery(action)}
                    className="w-full flex items-center justify-between text-left text-xs bg-white border border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#eff6ff] transition-colors p-2 rounded-sm text-[#0f172a]"
                  >
                    <span>{action}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#64748b] text-xs font-mono uppercase">
            Awaiting instructions...
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#cbd5e1] bg-white">
        <div className="text-[10px] font-mono text-[#64748b] mb-1">TERMINAL // INPUT</div>
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
            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-sm text-xs text-[#0f172a] p-2 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] resize-none font-mono"
            placeholder="Instruct the agent... (e.g. Find left arm spinners with risk < 30%)"
          ></textarea>
          <button 
            onClick={() => handleQuery()}
            disabled={isLoading}
            className="absolute bottom-2 right-2 bg-[#0f172a] text-white p-1 rounded-sm hover:bg-[#334155] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
