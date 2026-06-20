import React, { useState } from 'react';
import { SimulationState } from '../types';
import EmailClient from './EmailClient';
import ShieldDashboard from './ShieldDashboard';
import Terminal from './Terminal';
import Taskbar from './Taskbar';
import AgentDashboard from './AgentDashboard';
import WelcomeModal from './WelcomeModal';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Folder, Trash2, Globe, Cpu } from 'lucide-react';

export default function Desktop() {
  const [state, setState] = useState<SimulationState>(SimulationState.IDLE);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [windows, setWindows] = useState({
    email: { minimized: false, closed: false },
    shield: { minimized: false, closed: false },
    terminal: { minimized: false, closed: false },
    dashboard: { minimized: false, closed: true }
  });

  const toggleWindow = (id: 'email' | 'shield' | 'terminal' | 'dashboard') => {
    setWindows(prev => {
      if (prev[id].closed) {
        return { ...prev, [id]: { closed: false, minimized: false } };
      }
      return {
        ...prev,
        [id]: { ...prev[id], minimized: !prev[id].minimized }
      };
    });
  };

  const openWindow = (id: 'email' | 'shield' | 'terminal' | 'dashboard') => {
    setWindows(prev => ({
      ...prev,
      [id]: { closed: false, minimized: false }
    }));
  };

  const closeWindow = (id: 'email' | 'shield' | 'terminal' | 'dashboard') => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], closed: true }
    }));
  };

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setState(SimulationState.IDLE); // Reset
    
    // Auto-restore windows when simulation starts
    setWindows(prev => ({
      email: { minimized: false, closed: false },
      shield: { minimized: false, closed: false },
      terminal: { minimized: false, closed: false },
      dashboard: prev.dashboard
    }));

    setTimeout(() => {
      setState(SimulationState.ATTACK_INITIATED);
      
      setTimeout(() => {
        setState(SimulationState.EMAIL_OPENED);
        
        setTimeout(() => {
          setState(SimulationState.AGENT_PROCESSING);
          
          setTimeout(() => {
            setState(SimulationState.SHIELD_INTERVENTION);
            
            setTimeout(() => {
              setState(SimulationState.RESOLVED);
              setIsSimulating(false);
            }, 2500); // Wait in intervention before resolving
            
          }, 2000); // Time agent is "processing" before shield jumps in
          
        }, 1500); // Time looking at opened email
        
      }, 1000); // Time after attack initiated before email is auto-opened
      
    }, 500);
  };

  return (
    <div className="w-full h-screen overflow-hidden relative flex flex-col font-sans select-none bg-[#1e1e2e]">
      {/* Background Wallpaper */}
      <div className="absolute inset-0 z-0 bg-[#00173d] overflow-hidden">
         <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#005bc4] via-[#003087] to-[#00102b]"></div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 bottom-10 p-2 flex flex-col gap-2 z-0 w-24 mt-2">
        <DesktopIcon icon={<div className="text-purple-400 drop-shadow-md"><Cpu size={32} fill="currentColor" strokeWidth={1} /></div>} label="Launch Agent Web UI" onClick={() => openWindow('dashboard')} />
        <DesktopIcon icon={<div className="text-sky-300 drop-shadow-md"><FileText size={32} fill="currentColor" strokeWidth={1} /></div>} label="New Text Document.txt" />
        <DesktopIcon icon={<div className="text-yellow-200 drop-shadow-md"><Folder size={32} fill="currentColor" strokeWidth={1} /></div>} label="Projects" />
        <DesktopIcon icon={<div className="text-gray-300 drop-shadow-md"><Trash2 size={32} fill="none" strokeWidth={1.5} /></div>} label="Recycle Bin" />
        <DesktopIcon icon={<div className="text-[#4285F4] bg-white rounded-full p-1 drop-shadow-md"><Globe size={24} /></div>} label="Google Chrome" onClick={() => openWindow('email')} />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative z-10 p-6">
        {/* Layout Grid */}
        <div className="h-[calc(100vh-80px)] max-w-7xl mx-auto grid grid-cols-12 grid-rows-2 gap-6 pl-16">
          
          {/* Top Left: Browser / Email */}
          <div className="col-span-12 lg:col-span-7 row-span-1">
             <AnimatePresence>
               {!windows.email.minimized && !windows.email.closed && (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full">
                   <EmailClient key="email" state={state} onMinimize={() => toggleWindow('email')} onClose={() => closeWindow('email')} />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Top Right: Shield Dashboard */}
          <div className="col-span-12 lg:col-span-5 row-span-2 relative">
             <div className="absolute -inset-4 bg-red-500/5 rounded-3xl blur-xl pointer-events-none" style={{ opacity: state === SimulationState.SHIELD_INTERVENTION && !windows.shield.minimized && !windows.shield.closed ? 1 : 0, transition: 'opacity 0.3s' }} />
             <AnimatePresence>
               {!windows.shield.minimized && !windows.shield.closed && (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full">
                   <ShieldDashboard key="shield" state={state} onMinimize={() => toggleWindow('shield')} onClose={() => closeWindow('shield')} />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Bottom Left: Terminal */}
          <div className="col-span-12 lg:col-span-7 row-span-1">
             <AnimatePresence>
               {!windows.terminal.minimized && !windows.terminal.closed && (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full">
                   <Terminal key="terminal" state={state} onMinimize={() => toggleWindow('terminal')} onClose={() => closeWindow('terminal')} />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          
        </div>
      </div>

      {/* Absolute Agent Dashboard Window */}
      <div className="absolute inset-16 z-40 pointer-events-none">
        <AnimatePresence>
          {!windows.dashboard.minimized && !windows.dashboard.closed && (
            <div className="w-full h-full pointer-events-auto">
               <AgentDashboard key="dashboard" state={state} onMinimize={() => toggleWindow('dashboard')} onClose={() => closeWindow('dashboard')} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Taskbar */}
      <Taskbar onSimulate={startSimulation} isSimulating={isSimulating} windows={windows} onToggleWindow={toggleWindow} />
      
      {/* Full screen flash effect on intervention */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: state === SimulationState.SHIELD_INTERVENTION ? 0.15 : 0 }}
        className="absolute inset-0 bg-red-500 pointer-events-none z-40 transition-opacity duration-300"
      />

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
    </div>
  );
}

function DesktopIcon({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 transition-colors cursor-pointer group">
      {icon}
      <span className="text-white text-center text-[11px] leading-tight drop-shadow-md group-hover:bg-blue-600/50 px-1 rounded truncate w-full">{label}</span>
    </div>
  );
}
