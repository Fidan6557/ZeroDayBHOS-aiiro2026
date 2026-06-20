"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Activity, Ban, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api, type Stats, type ScanListItem } from "@/lib/api";
import { classificationColor, riskColor, cn } from "@/lib/utils";

const COLORS = ["#ef4444", "#f59e0b", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.stats(), api.scans(10)])
      .then(([s, sc]) => { setStats(s); setScans(sc); })
      .catch(() => setError("Backend unavailable. Start API on port 8000."));
  }, []);

  const categoryData = stats
    ? Object.entries(stats.categories).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
    : [];

  return (
    <div className="p-8">
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white">
          Security Dashboard
        </motion.h1>
        <p className="text-slate-500 text-sm mt-1">Real-time AI content threat monitoring</p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Shield className="text-shield-cyan" />} label="Total Scans" value={stats?.total_scans ?? "—"} />
        <StatCard icon={<AlertTriangle className="text-red-400" />} label="Threats Detected" value={stats?.total_threats ?? "—"} accent="red" />
        <StatCard icon={<TrendingUp className="text-amber-400" />} label="Avg Risk Score" value={stats?.avg_risk_score ?? "—"} accent="amber" />
        <StatCard icon={<Ban className="text-red-500" />} label="Blocked" value={stats?.blocked_count ?? "—"} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-shield-cyan" /> Recent Scans
          </h2>
          <div className="space-y-2">
            {scans.length === 0 && <p className="text-slate-500 text-sm">No scans yet. Run a scan or simulation.</p>}
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-shield-border">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-300 truncate font-mono">{scan.original_preview}</p>
                  <p className="text-xs text-slate-500 mt-1">{scan.source_type} · {scan.findings_count} findings</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={cn("text-sm font-bold font-mono", riskColor(scan.risk_score))}>{scan.risk_score}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded border uppercase", classificationColor(scan.classification))}>
                    {scan.classification}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Threat Categories</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1e293b" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm">No threat data yet</p>
          )}
        </div>
      </div>

      {stats && Object.keys(stats.sources).length > 0 && (
        <div className="mt-6 glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Attack Sources</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.sources).map(([source, count]) => (
              <div key={source} className="px-4 py-2 rounded-lg bg-black/20 border border-shield-border">
                <span className="text-xs text-slate-500 uppercase">{source}</span>
                <span className="ml-2 text-white font-mono font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span></div>
      <p className={cn("text-3xl font-bold font-mono", accent === "red" ? "text-red-400" : accent === "amber" ? "text-amber-400" : "text-white")}>{value}</p>
    </motion.div>
  );
}
