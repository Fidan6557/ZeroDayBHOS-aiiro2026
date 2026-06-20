"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, ScanSearch, Zap, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scan", icon: ScanSearch },
  { href: "/simulation", label: "Attack Simulation", icon: Zap },
  { href: "/api-docs", label: "API Integration", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-shield-border bg-shield-card/50 flex flex-col shrink-0">
      <div className="p-6 border-b border-shield-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-shield-cyan" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">AgentShield</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">AI Content Firewall</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              pathname === href
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-shield-border">
        <div className="glass-card rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            PROTECTION ACTIVE
          </div>
        </div>
      </div>
    </aside>
  );
}
