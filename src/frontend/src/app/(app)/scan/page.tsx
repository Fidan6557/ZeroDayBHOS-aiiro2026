"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Link2, Upload, Loader2 } from "lucide-react";
import { api, type ScanResult } from "@/lib/api";
import { classificationColor, riskColor, cn } from "@/lib/utils";

type Tab = "text" | "file" | "url";

export default function ScanPage() {
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const runScan = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let res: ScanResult;
      if (tab === "text") {
        if (!text.trim()) throw new Error("Enter text to scan");
        res = await api.scanText(text);
      } else if (tab === "url") {
        if (!url.trim()) throw new Error("Enter URL");
        res = await api.scanUrl(url);
      } else {
        throw new Error("Select a file");
      }
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.scanFile(file);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "File scan failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "text", label: "Text", icon: <FileText size={16} /> },
    { id: "file", label: "File", icon: <Upload size={16} /> },
    { id: "url", label: "URL", icon: <Link2 size={16} /> },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Content Scanner</h1>
        <p className="text-slate-500 text-sm mt-1">Analyze text, files, or URLs for AI agent threats</p>
      </header>

      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                tab === t.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:bg-white/5"
              )}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === "text" && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste content to scan for prompt injection, data exfiltration, tool abuse..."
            className="w-full h-40 bg-black/30 border border-shield-border rounded-lg p-4 text-sm font-mono text-slate-300 resize-none focus:outline-none focus:border-cyan-500/50"
          />
        )}
        {tab === "url" && (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            className="w-full bg-black/30 border border-shield-border rounded-lg p-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
          />
        )}
        {tab === "file" && (
          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-shield-border rounded-lg cursor-pointer hover:border-cyan-500/30 transition-colors">
            <Upload className="text-slate-500 mb-2" />
            <span className="text-sm text-slate-400">Drop PDF, DOCX, or TXT</span>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFile} className="hidden" />
          </label>
        )}

        {tab !== "file" && (
          <button
            onClick={runScan}
            disabled={loading}
            className="mt-4 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Scan Content
          </button>
        )}
        {loading && tab === "file" && (
          <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Scanning file...
          </div>
        )}
      </div>

      {error && <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase">Risk Score</p>
                <p className={cn("text-5xl font-bold font-mono", riskColor(result.risk_score))}>{result.risk_score}</p>
              </div>
              <div className="text-right">
                <span className={cn("text-sm px-3 py-1 rounded border uppercase font-mono", classificationColor(result.classification))}>
                  {result.classification}
                </span>
                {result.blocked && <p className="text-red-400 text-xs mt-2 font-mono">BLOCKED</p>}
                <p className="text-xs text-slate-500 mt-2">Layers: {result.layers_used.join(", ")}</p>
              </div>
            </div>

            {result.findings.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Findings ({result.findings.length})</h3>
                <div className="space-y-3">
                  {result.findings.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-black/20 border border-shield-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-red-400 uppercase font-mono">{f.category.replace(/_/g, " ")}</span>
                        <span className="text-xs text-slate-500">{f.layer} · {f.severity}</span>
                      </div>
                      <p className="text-sm text-slate-300">{f.explanation}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1 truncate">"{f.matched_text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Sanitized Content</h3>
              <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap bg-black/30 p-4 rounded-lg border border-shield-border">
                {result.sanitized_content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
