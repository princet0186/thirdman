"use client";

import { Database, Target, Activity, LineChart, Shield, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationRail() {
  const pathname = usePathname();

  const modules = [
    { id: 'scout', icon: Target, path: '/scout' },
    { id: 'injury', icon: Activity, path: '/injury' },
    { id: 'form', icon: LineChart, path: '/form' },
    { id: 'tactics', icon: Shield, path: '/tactics' },
    { id: 'db', icon: Database, path: '#' },
  ];

  return (
    <aside className="w-12 bg-[#0f172a] flex flex-col items-center py-3 flex-shrink-0 z-20">
      <div className="mb-6 text-white">
        <div className="w-8 h-8 flex items-center justify-center font-mono font-bold border border-[#334155] rounded-sm text-xs bg-[#1e293b]">
          3M
        </div>
      </div>
      
      <nav className="flex-1 w-full flex flex-col gap-2 items-center">
        {modules.map((m) => {
          const isActive = pathname?.startsWith(m.path) && m.path !== '#';
          return (
            <Link
              key={m.id}
              href={m.path}
              className={`w-8 h-8 flex items-center justify-center rounded-sm transition-colors ${
                isActive 
                  ? "bg-[#3b82f6] text-white" 
                  : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"
              }`}
              title={`Module: ${m.id}`}
            >
              <m.icon className="w-4 h-4" />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto w-full flex flex-col gap-2 items-center border-t border-[#334155] pt-4">
        <Link href="#" className="w-8 h-8 flex items-center justify-center text-[#94a3b8] hover:text-white rounded-sm hover:bg-[#1e293b]">
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
