"use client";

import { Mail, Terminal, ShieldAlert, Search, LayoutGrid, Wifi, Volume2, Battery, MessageSquare, Cpu } from "lucide-react";
import { motion } from "framer-motion";

interface TaskbarProps {
  onSimulate: () => void;
  isSimulating: boolean;
  windows: {
    email: { minimized: boolean; closed: boolean };
    terminal: { minimized: boolean; closed: boolean };
    shield: { minimized: boolean; closed: boolean };
    dashboard: { minimized: boolean; closed: boolean };
  };
  onToggleWindow: (id: "email" | "shield" | "terminal" | "dashboard") => void;
}

export default function Taskbar({ onSimulate, isSimulating, windows, onToggleWindow }: TaskbarProps) {
  return (
    <div className="absolute bottom-0 w-full h-10 bg-[#1e1e1e] border-t border-[#333] flex items-center justify-between z-50 text-white select-none">
      <div className="flex h-full items-center">
        <button className="h-full px-3 hover:bg-white/10 transition-colors flex items-center justify-center text-[#00adef]">
          <LayoutGrid size={20} fill="currentColor" />
        </button>
        <div className="h-full flex items-center bg-white/10 w-64 hover:bg-white/20 transition-colors cursor-text group">
          <div className="flex items-center px-3 gap-2 w-full text-gray-300">
            <Search size={16} className="text-gray-400 group-hover:text-white" />
            <span className="text-sm">Type here to search</span>
          </div>
        </div>
        <div className="flex h-full items-center ml-1">
          <TaskbarIcon icon={<Mail size={20} className="text-blue-400" />} active={!windows.email.minimized && !windows.email.closed} open={!windows.email.closed} onClick={() => onToggleWindow("email")} />
          <TaskbarIcon icon={<Terminal size={20} className="text-gray-300" />} active={!windows.terminal.minimized && !windows.terminal.closed} open={!windows.terminal.closed} onClick={() => onToggleWindow("terminal")} />
          <TaskbarIcon icon={<ShieldAlert size={20} className="text-emerald-400" />} active={!windows.shield.minimized && !windows.shield.closed} open={!windows.shield.closed} onClick={() => onToggleWindow("shield")} />
          <TaskbarIcon icon={<Cpu size={20} className="text-purple-400" />} active={!windows.dashboard.minimized && !windows.dashboard.closed} open={!windows.dashboard.closed} onClick={() => onToggleWindow("dashboard")} />
        </div>
      </div>
      <div className="flex h-full items-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onSimulate}
          disabled={isSimulating}
          className={`mr-4 px-3 py-1 rounded text-xs font-bold transition-colors ${isSimulating ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-md"}`}
        >
          {isSimulating ? "Simulating..." : "Simulate Attack"}
        </motion.button>
        <div className="flex h-full items-center hover:bg-white/10 transition-colors px-2 cursor-pointer">
          <div className="flex items-center gap-2 text-gray-300">
            <Wifi size={14} /><Volume2 size={14} /><Battery size={14} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full hover:bg-white/10 transition-colors px-2 cursor-pointer text-xs text-gray-200">
          <span>12:45 PM</span><span>10/24/2026</span>
        </div>
        <div className="flex h-full items-center justify-center hover:bg-white/10 transition-colors px-3 cursor-pointer border-l border-white/10 text-gray-300">
          <MessageSquare size={16} />
        </div>
        <div className="h-full w-1 border-l border-white/20 hover:bg-white/20 cursor-pointer" />
      </div>
    </div>
  );
}

function TaskbarIcon({ icon, active, open, onClick }: { icon: React.ReactNode; active?: boolean; open?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`relative flex items-center justify-center h-full w-12 hover:bg-white/10 transition-colors cursor-pointer ${active ? "bg-white/5" : ""}`}>
      {icon}
      {open && <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#00adef] transition-all duration-200 ${active ? "w-full" : "w-2"}`} />}
    </div>
  );
}
