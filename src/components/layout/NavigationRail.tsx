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
    <aside className="w-12 bg-[#052e16] flex flex-col items-center py-3 flex-shrink-0 z-20 border-r-2 border-[#ca8a04]">
      <div className="mb-6 text-white">
        <div className="w-8 h-8 flex items-center justify-center font-mono font-bold border border-[#ca8a04] rounded-sm text-xs bg-[#14532d] text-[#ca8a04]">
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
              className={`w-8 h-8 flex items-center justify-center rounded-sm transition-colors ${isActive
                  ? "bg-[#ca8a04] text-white"
                  : "text-[#86efac] hover:text-white hover:bg-[#14532d]"
                }`}
              title={`Module: ${m.id}`}
            >
              <m.icon className="w-4 h-4" />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto w-full flex flex-col gap-2 items-center border-t border-[#14532d] pt-4">
        <Link href="/settings" className="w-8 h-8 flex items-center justify-center text-[#86efac] hover:text-white rounded-sm hover:bg-[#14532d]">
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
