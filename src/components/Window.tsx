import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { motion } from 'motion/react';

interface WindowProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'green' | 'red';
  variant?: 'dark' | 'light';
  onMinimize?: () => void;
  onClose?: () => void;
}

export default function Window({ title, icon, children, className = '', glow = 'none', variant = 'dark', onMinimize, onClose }: WindowProps) {
  let glowClass = '';
  if (glow === 'green') glowClass = 'shadow-[0_0_30px_rgba(34,197,94,0.4)] border-green-500/50';
  if (glow === 'red') glowClass = 'shadow-[0_0_50px_rgba(239,68,68,0.3)] border-red-500 ring-2 ring-red-500/50 z-50';

  const isDark = variant === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white' : 'bg-white border-[#cccccc] text-black'} border ${className} ${glowClass}`}
    >
      {/* Title bar */}
      <div className={`flex items-center justify-between select-none h-8 ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
        <div className={`flex items-center gap-2 px-3 text-[13px] ${isDark ? 'text-gray-300' : 'text-black'}`}>
          {icon}
          <span>{title}</span>
        </div>
        <div className="flex h-full">
          <button onClick={onMinimize} className={`w-12 h-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/10 text-gray-600'}`}>
            <Minus size={14} />
          </button>
          <button className={`w-12 h-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/10 text-gray-600'}`}>
            <Square size={12} />
          </button>
          <button onClick={onClose} className={`w-12 h-full flex items-center justify-center transition-colors hover:bg-[#e81123] hover:text-white ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </motion.div>
  );
}
