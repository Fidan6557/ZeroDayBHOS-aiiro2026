"use client";

import { Shield, Info, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#1e1e2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
      >
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/40 to-emerald-900/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center justify-center text-emerald-400">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AgentShield Security Demo</h2>
            <p className="text-gray-400 text-sm">Interactive Prompt Injection Prevention</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl leading-relaxed text-sm text-gray-300">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Info size={18} className="text-blue-400" />
              About This Demo
            </h3>
            <p>
              This environment simulates a Windows developer workspace running a local AI assistant (<span className="text-white font-mono bg-white/10 px-1 rounded">OpenClaw Agent</span>).
              Click <span className="text-red-400 font-bold">Simulate Attack</span> in the taskbar to trigger a malicious email with hidden prompt injection.
              Watch how AgentShield intercepts the dangerous command before it executes.
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
            <Play fill="currentColor" size={16} />
            Enter Simulation
          </button>
        </div>
      </motion.div>
    </div>
  );
}
