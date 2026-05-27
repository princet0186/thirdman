"use client";

import { Sparkles, Terminal, ArrowRight, Loader2, ChevronDown, ChevronRight, Square } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAppContext } from "@/lib/AppContext";

interface AIResponse {
  reasoning: string;
  steps: string[];
  actions: string[];
  insights?: string;
}

const BTS_STEPS = [
  "Parsing natural language query...",
  "Generating Elasticsearch DSL...",
  "Querying Elastic Cloud index...",
  "Running Gemini insight synthesis...",
];

const BTS_DELAYS = [0, 800, 1600, 2400];

export default function AIPanel() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [traceOpen, setTraceOpen] = useState(false);
  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepsTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { setSelectedPlayer, setPlayers, players, currentModule, pendingQuery, setPendingQuery } = useAppContext();

  useEffect(() => {
    if (pendingQuery) {
      setQuery(pendingQuery);
      handleQuery(pendingQuery);
      setPendingQuery(null);
    }
  }, [pendingQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, visibleSteps, isLoading]);

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

  const startBTSAnimation = () => {
    setVisibleSteps(0);
    stepsTimers.current.forEach(t => clearTimeout(t));
    stepsTimers.current = [];

    BTS_DELAYS.forEach((delay, idx) => {
      const t = setTimeout(() => {
        setVisibleSteps(idx + 1);
      }, delay);
      stepsTimers.current.push(t);
    });
  };

  const stopBTSAnimation = () => {
    stepsTimers.current.forEach(t => clearTimeout(t));
    stepsTimers.current = [];
  };

  const handleAbort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
    stopBTSAnimation();
    setVisibleSteps(0);
    setElapsedMs(Date.now() - startTime.current);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleQuery = async (overrideQuery?: string) => {
    const queryToRun = overrideQuery || query;
    if (!queryToRun.trim()) return;

    if (overrideQuery) setQuery(overrideQuery);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setResponse(null);
    setTraceOpen(false);
    startTime.current = Date.now();
    startBTSAnimation();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime.current);
    }, 100);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToRun, module: currentModule }),
        signal: controller.signal,
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
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(err);
    } finally {
      setIsLoading(false);
      setElapsedMs(Date.now() - startTime.current);
      stopBTSAnimation();
      setVisibleSteps(BTS_STEPS.length);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      abortRef.current = null;
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">

        {(isLoading || (response && visibleSteps > 0)) && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#b8976a] uppercase">SYS // EXECUTION_PIPELINE</div>
            {BTS_STEPS.slice(0, visibleSteps).map((step, idx) => {
              const isCurrent = isLoading && idx === visibleSteps - 1;
              return (
                <div
                  key={idx}
                  className="tm-step-animate flex items-center gap-2 text-[11px] font-mono py-0.5"
                >
                  {isCurrent ? (
                    <Loader2 className="w-3 h-3 text-[#ca8a04] animate-spin flex-shrink-0" />
                  ) : (
                    <span className="w-3 h-3 flex items-center justify-center text-[#6b7280] flex-shrink-0">›</span>
                  )}
                  <span className={isCurrent ? "text-[#ca8a04]" : "text-[#6b7280]"}>
                    {step}
                  </span>
                </div>
              );
            })}

            {/* Worked for Xm */}
            {!isLoading && response && (
              <div className="tm-step-animate text-[10px] font-mono text-[#6b7280] mt-1 pt-1 border-t border-[#d6c4a8]">
                Worked for {formatDuration(elapsedMs)}
              </div>
            )}
          </div>
        )}

        {/* ─── Response ─── */}
        {response && !isLoading && (
          <>
            {response.insights && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-[#b8976a] uppercase">SYS // ANALYSIS</div>
                <div
                  onClick={handleInsightsClick}
                  className="bg-white border border-[#d6c4a8] p-2.5 rounded-sm text-xs text-[#374151] shadow-sm font-sans leading-relaxed [&_b]:text-[#166534] [&_b]:font-bold [&_b]:cursor-pointer hover:[&_b]:underline"
                  dangerouslySetInnerHTML={{ __html: response.insights }}
                />
              </div>
            )}

            {(response.reasoning || (response.steps && response.steps.length > 0)) && (
              <div className="border border-[#d6c4a8] rounded-sm overflow-hidden">
                <button
                  onClick={() => setTraceOpen(!traceOpen)}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono text-[#6b7280] bg-[#f5f0e8] hover:bg-[#f0ebe0] transition-colors uppercase"
                >
                  {traceOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  <span>Worked for {formatDuration(elapsedMs)}</span>
                </button>
                {traceOpen && (
                  <div className="p-2.5 space-y-2 bg-[#faf8f3] border-t border-[#d6c4a8]">
                    {response.reasoning && (
                      <div>
                        <div className="text-[9px] font-mono text-[#b8976a] uppercase mb-1">Reasoning</div>
                        <p className="text-[11px] text-[#374151] leading-relaxed">{response.reasoning}</p>
                      </div>
                    )}
                    {response.steps && response.steps.length > 0 && (
                      <div>
                        <div className="text-[9px] font-mono text-[#b8976a] uppercase mb-1">Steps</div>
                        <ol className="space-y-0.5">
                          {response.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#374151]">
                              <span className="text-[#b8976a] font-mono flex-shrink-0">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {response.actions && response.actions.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-[#b8976a] uppercase">Suggested Follow-ups</div>
                <div className="space-y-1.5">
                  {response.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuery(action)}
                      className="w-full flex items-center gap-2.5 text-left text-xs bg-white border border-[#d6c4a8] hover:border-[#ca8a04] hover:bg-[#fef9ee] hover:shadow-sm transition-all duration-200 p-2.5 rounded-sm text-[#0f172a] group"
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-sm bg-[#eef5e6] text-[#166534] flex-shrink-0 group-hover:bg-[#166534] group-hover:text-white transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                      <span className="flex-1 leading-snug">{action}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!response && !isLoading && (
          <div className="flex items-center justify-center h-full text-[#b8976a] text-xs font-mono uppercase">
            Awaiting instructions...
          </div>
        )}
      </div>

      {/* ─── Input area ─── */}
      <div className="p-3 border-t-2 border-[#ca8a04] bg-gradient-to-r from-[#14532d] to-[#166534]">
        <div className="text-[10px] font-mono text-[#86efac] mb-1">TERMINAL // INPUT</div>
        <div className="relative">
          <textarea
            id="ai-query-input"
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (isLoading) {
                  handleAbort();
                } else {
                  handleQuery();
                }
              }
            }}
            className="w-full bg-[#0a3d1e] border border-[#166534] rounded-sm text-xs text-white p-2 focus:outline-none focus:border-[#ca8a04] focus:ring-1 focus:ring-[#ca8a04] resize-none font-mono placeholder:text-[#86efac] placeholder:opacity-50"
            placeholder="Instruct the agent... (e.g. Find left arm spinners with risk < 30%)"
          ></textarea>
          {/* Single button: toggles between Submit and Stop */}
          <button
            onClick={() => isLoading ? handleAbort() : handleQuery()}
            className={`absolute bottom-2 right-2 p-1 rounded-sm transition-colors ${isLoading
                ? "bg-[#ef4444] text-white hover:bg-[#dc2626]"
                : "bg-[#ca8a04] text-white hover:bg-[#a16207]"
              }`}
          >
            {isLoading ? <Square className="w-3 h-3 fill-current" /> : <Terminal className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
