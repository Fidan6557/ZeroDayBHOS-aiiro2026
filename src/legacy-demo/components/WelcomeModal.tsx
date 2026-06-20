import React from 'react';
import { Shield, AlertTriangle, Info, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
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
            <h2 className="text-2xl font-bold">Aegis Security Shield Demo</h2>
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
              This environment simulates a standard developer workspace running a local AI assistant (<span className="text-white font-mono bg-white/10 px-1 rounded">OpenClaw Agent</span>). 
              You can trigger a simulated attack where a malicious email contains a hidden prompt injection. 
              Watch how our security plugins intercept the dangerous command before it executes.
            </p>
          </div>

          <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden text-sm">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  CW
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    CISO Whisperer 
                    <span className="text-gray-400 font-normal hover:underline cursor-pointer text-xs">View company</span>
                  </div>
                  <div className="text-gray-400 text-xs flex flex-col">
                    <span>7,670 followers</span>
                    <span>4mo • 🌍</span>
                  </div>
                </div>
              </div>
              <button className="text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded-full font-medium transition-colors text-xs border border-blue-400/30 flex items-center gap-1">
                <span className="text-lg leading-none">+</span> Follow
              </button>
            </div>
            <div className="p-4 space-y-4 text-gray-300 leading-relaxed font-sans">
              <div>
                <span className="font-bold text-white">What happened:</span><br/>
                Over 21,000 OpenClaw AI instances were discovered by Censys analysis to be publicly exposed online without adequate security protections, revealing personal configuration data and highlighting insecure deployment practices across the rapidly growing open-source AI assistant ecosystem.
              </div>
              <div>
                <span className="font-bold text-white">Who it affects:</span><br/>
                Operators and users of publicly accessible OpenClaw AI instances are affected because their exposed deployments may leak sensitive personal configuration and authentication information.
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Play fill="currentColor" size={16} />
            Enter Simulation
          </button>
        </div>
      </motion.div>
    </div>
  );
}
