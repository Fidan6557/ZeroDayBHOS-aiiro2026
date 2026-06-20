"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Activity, Ban, TrendingUp, Bell, FileText, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api, type Stats, type ScanListItem, type Notification, type IncidentReport } from "@/lib/api";
import { classificationColor, riskColor, threatLevelColor, cn } from "@/lib/utils";

const COLORS = ["#ef4444", "#f59e0b", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => {
      Promise.all([api.stats(), api.scans(10), api.notifications(8)])
        .then(([s, sc, n]) => {
          setStats(s);
          setScans(sc);
          setNotifications(n);
          setError("");
        })
        .catch(() => setError("Backend unavailable. Start API on port 8000."));
    };
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const openReport = async (scanId: number) => {
    try {
      setReport(await api.incidentReport(scanId));
    } catch {
      setError("Incident report could not be generated.");
    }
  };

  const acknowledge = async (notification: Notification) => {
    if (!notification.is_read) await api.markNotificationRead(notification.id);
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
    await openReport(notification.scan_id);
  };

  const categoryData = stats
    ? Object.entries(stats.categories).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
    : [];

  return (
    <div className="p-8">
      <header className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white">
          Security Dashboard
        </motion.h1>
        <p className="text-slate-500 text-sm mt-1">Live smart-city AI content threat monitoring · refreshes every 5 seconds</p>
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
                  <span className={cn("text-[10px] px-2 py-0.5 rounded border uppercase", threatLevelColor(scan.threat_level))}>
                    {scan.threat_level}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded border uppercase", classificationColor(scan.classification))}>
                    {scan.classification}
                  </span>
                  <button onClick={() => openReport(scan.id)} title="Generate incident report" className="text-slate-500 hover:text-cyan-400">
                    <FileText size={16} />
                  </button>
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

      <div className="mt-6 glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Bell size={16} className="text-amber-400" /> Administrator Notifications
          <span className="ml-auto text-xs text-slate-500">{stats?.unread_notifications ?? 0} unread</span>
        </h2>
        <div className="space-y-2">
          {notifications.length === 0 && <p className="text-slate-500 text-sm">No security notifications.</p>}
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => acknowledge(notification)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                notification.is_read ? "bg-black/10 border-shield-border opacity-60" : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-200">{notification.title}</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded border uppercase", threatLevelColor(notification.threat_level))}>
                  {notification.threat_level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
            </button>
          ))}
        </div>
      </div>

      {report && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setReport(null)}>
          <div className="glass-card rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{report.title}</h2>
                <p className="text-xs text-slate-500">{new Date(report.generated_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setReport(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <span className={cn("text-xs px-2 py-1 rounded border uppercase", threatLevelColor(report.threat_level))}>{report.threat_level}</span>
              <span className={cn("text-xs px-2 py-1 rounded border uppercase", classificationColor(report.classification))}>{report.classification}</span>
              <span className="text-xs px-2 py-1 rounded border border-shield-border text-slate-300">Risk {report.risk_score}/100</span>
            </div>
            <p className="text-sm text-slate-300 mb-5">{report.summary}</p>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Recommended actions</h3>
            <ol className="list-decimal pl-5 text-sm text-slate-400 space-y-1">
              {report.recommended_actions.map((action) => <li key={action}>{action}</li>)}
            </ol>
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
