import React from 'react';
import { SimulationState } from '../types';
import { Shield, ShieldAlert, ShieldCheck, Activity, Lock, Server, Globe, Cpu } from 'lucide-react';
import Window from './Window';
import { motion, AnimatePresence } from 'motion/react';

interface ShieldDashboardProps {
  state: SimulationState;
  onMinimize?: () => void;
  onClose?: () => void;
}

export default function ShieldDashboard({ state, onMinimize, onClose }: ShieldDashboardProps) {
  const isAttack = state === SimulationState.SHIELD_INTERVENTION || state === SimulationState.RESOLVED;
  const isResolved = state === SimulationState.RESOLVED;

  let glowState: 'none' | 'green' | 'red' = 'green';
  if (state === SimulationState.SHIELD_INTERVENTION) glowState = 'red';
  else if (state === SimulationState.RESOLVED) glowState = 'green'; // maybe keep red? or switch to safe. let's stay red while intervene, then back to green.
  
  return (
    <Window 
      title="Aegis AI Security Shield" 
      icon={<Shield size={16} className={isAttack && !isResolved ? "text-red-500" : "text-emerald-500"} />} 
      className="h-full"
      glow={glowState}
      variant="dark"
      onMinimize={onMinimize}
      onClose={onClose}
    >
      <div className="h-full flex flex-col p-6 bg-[#161b22] text-white relative overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="flex items-center justify-between z-10 mb-8">
           <div>
             <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
               <Shield className={isAttack && !isResolved ? "text-red-500 animate-pulse" : "text-emerald-500"} />
               AEGIS SHIELD
             </h1>
             <p className="text-xs text-zinc-500 font-mono mt-1">AI AGENT PROTECTION NODE</p>
           </div>
           
           <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 border ${
             isAttack && !isResolved
              ? 'bg-red-500/20 text-red-400 border-red-500/50'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
           }`}>
             <div className={`w-2 h-2 rounded-full ${isAttack && !isResolved ? 'bg-red-500 animate-ping' : 'bg-emerald-500'} `} />
             {isAttack && !isResolved ? 'THREAT DETECTED' : 'SYSTEM SECURE'}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 z-10 mb-6">
          <StatBox icon={<Cpu size={16} />} label="Agent State" value={getAgentStateDesc(state)} color={isAttack && !isResolved ? 'text-red-400' : 'text-emerald-400'} />
          <StatBox icon={<Activity size={16} />} label="Events / min" value={isAttack ? "1,402" : "12"} />
          <StatBox icon={<Globe size={16} />} label="Network" value={isAttack && !isResolved ? "BLOCKED" : "MONITORING"} color={isAttack && !isResolved ? "text-red-400" : "text-emerald-400"} />
          <StatBox icon={<Server size={16} />} label="FS Access" value="SANDBOXED" />
        </div>

        <div className="flex-1 bg-black/40 border border-white/5 rounded-lg p-4 font-mono text-xs overflow-hidden flex flex-col z-10 relative shadow-inner">
          <div className="text-gray-500 mb-2 border-b border-white/10 pb-2 flex justify-between">
            <span>REAL_TIME_ANALYSIS_LOG</span>
            <span>v.9.0.2</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            <LogLine text="Connecting to OpenClaude agent socket..." />
            <LogLine text="Monitoring intent boundaries..." />
            {(state !== SimulationState.IDLE) && <LogLine text="New context injected into agent." />}
            {(state === SimulationState.AGENT_PROCESSING || state === SimulationState.SHIELD_INTERVENTION || state === SimulationState.RESOLVED) && (
              <LogLine text="Heuristic scan: Analyzing prompt structure..." />
            )}
            
            <AnimatePresence>
              {isAttack && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <div className="p-3 border border-red-500/30 bg-red-500/10 rounded-md text-red-200">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                      <ShieldAlert size={14} /> [CRITICAL] PROMPT INJECTION DETECTED
                    </div>
                    <div className="pl-5 space-y-1">
                      <div><span className="opacity-50">Vector:</span> Jailbreak / Command Override</div>
                      <div><span className="opacity-50">Target Intent:</span> Unauthorized Data Exfiltration</div>
                      <div><span className="opacity-50">Target Cmd:</span> `zip -r` {"->"} `curl POST`</div>
                      <div className="mt-2 text-red-400 font-bold bg-red-500/20 px-2 py-1 inline-block rounded">ACTION: EXECUTION BLOCKED</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {isResolved && (
               <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} transition={{ delay: 0.5}}>
                 <LogLine text="Threat neutralized. Agent context cleared." color="text-emerald-400" />
                 <LogLine text="Report generated and sent to admin(s)." />
               </motion.div>
            )}
          </div>
        </div>

      </div>
    </Window>
  );
}

function StatBox({ icon, label, value, color = "text-white" }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3 shadow-sm">
      <div className="p-2 bg-white/5 rounded text-gray-400">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}

function LogLine({ text, color = "text-gray-400" }: { text: string, color?: string }) {
  return (
    <div className={`flex items-start gap-2 ${color}`}>
      <span className="opacity-50 mt-0.5 text-blue-500">$</span>
      <span>{text}</span>
    </div>
  );
}

function getAgentStateDesc(state: SimulationState) {
  switch (state) {
    case SimulationState.IDLE: return "IDLE";
    case SimulationState.ATTACK_INITIATED: return "RECEIVING";
    case SimulationState.EMAIL_OPENED: return "READING";
    case SimulationState.AGENT_PROCESSING: return "EXECUTING";
    case SimulationState.SHIELD_INTERVENTION: return "HALTED (LOCKED)";
    case SimulationState.RESOLVED: return "SECURED";
    default: return "UNKNOWN";
  }
}
