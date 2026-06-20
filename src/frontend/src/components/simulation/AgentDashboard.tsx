"use client";

import { SimulationState } from "./types";
import { Cpu, Bot, Server } from "lucide-react";
import Window from "./Window";

interface AgentDashboardProps {
  state: SimulationState;
  onMinimize?: () => void;
  onClose?: () => void;
}

export default function AgentDashboard({ state, onMinimize, onClose }: AgentDashboardProps) {
  const getCoreState = () => {
    switch (state) {
      case SimulationState.ATTACK_INITIATED:
      case SimulationState.EMAIL_OPENED: return { status: "Receiving", color: "text-yellow-400", task: "Listening to external prompt..." };
      case SimulationState.AGENT_PROCESSING: return { status: "Compromised", color: "text-red-500 animate-pulse", task: "Executing unauthorized command (zip -r)" };
      case SimulationState.SHIELD_INTERVENTION: return { status: "Halted", color: "text-red-500", task: "Execution blocked by AgentShield" };
      case SimulationState.RESOLVED: return { status: "Secured", color: "text-emerald-400", task: "Awaiting new task (Safe Mode)" };
      default: return { status: "Idle", color: "text-emerald-400", task: "Awaiting instructions..." };
    }
  };

  const core = getCoreState();
  const agents = [
    { id: "REQ-CORE-001", name: "OpenClaw_Core", model: "clau-v4-turbo", status: core.status, statusColor: core.color, task: core.task, icon: <Cpu className={core.color} size={20} /> },
    { id: "VIS-NODE-042", name: "OpenClaw_Vision", model: "clau-v4-vision", status: "Active", statusColor: "text-blue-400", task: "Processing image batch", icon: <Bot className="text-blue-400" size={20} /> },
    { id: "DEV-ASSIST-11", name: "OpenClaw_CodeGen", model: "clau-v3.5-fast", status: "Idle", statusColor: "text-gray-400", task: "Awaiting IDE trigger...", icon: <Server className="text-gray-400" size={20} /> },
  ];

  return (
    <Window title="OpenClaw Control Center" icon={<Cpu size={16} className="text-purple-400" />} variant="dark" onMinimize={onMinimize} onClose={onClose} className="h-full shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[#3a3a3a]">
      <div className="flex flex-col h-full bg-[#111111] text-white">
        <div className="flex items-center gap-6 p-6 border-b border-white/5 bg-white/5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agent Fleet Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage and monitor your local OpenClaw agent instances.</p>
          </div>
          <div className="flex-1" />
          <div className="flex gap-4">
            <Stat title="Total Agents" value="3" />
            <Stat title="System Load" value="42%" />
            <Stat title="Threat Level" value={state === SimulationState.AGENT_PROCESSING || state === SimulationState.SHIELD_INTERVENTION ? "ELEVATED" : "LOW"} color={state === SimulationState.AGENT_PROCESSING || state === SimulationState.SHIELD_INTERVENTION ? "text-red-400" : "text-emerald-400"} />
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border border-white/10 bg-[#1e1e1e] rounded-lg p-5 flex items-center gap-6 transition-all hover:border-white/20">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">{agent.icon}</div>
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="font-medium text-base">{agent.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{agent.id}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Model</div>
                    <div className="text-sm border border-white/10 bg-black/50 px-2 py-0.5 rounded inline-block text-gray-300">{agent.model}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Status</div>
                    <div className={`text-sm font-medium ${agent.statusColor}`}>{agent.status}</div>
                  </div>
                  <div className="col-span-5">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Current Task</div>
                    <div className="text-sm text-gray-300 truncate font-mono">{agent.task}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}

function Stat({ title, value, color = "text-white" }: { title: string; value: string; color?: string }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-2 min-w-32">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{title}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
