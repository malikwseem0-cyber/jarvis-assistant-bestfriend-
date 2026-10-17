import React from 'react';
import { Cpu, HardDrive, Wifi, BatteryCharging, Shield, Activity, Clock } from 'lucide-react';
import { SystemStatusData } from '../types';

interface SystemTelemetryProps {
  status: SystemStatusData | null;
  securityLevel?: number;
}

export const SystemTelemetry: React.FC<SystemTelemetryProps> = ({ status, securityLevel = 3 }) => {
  if (!status) {
    return (
      <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 text-xs font-mono text-cyan-400">
        INITIALIZING SENSORS...
      </div>
    );
  }

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.06)] font-mono text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider text-cyan-300 uppercase text-[11px]">
            WINDOWS 10/11 SUBSYSTEM STATUS
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px]">
          <Clock className="w-3 h-3" />
          <span>UPTIME: {status.uptime}</span>
        </div>
      </div>

      {/* Grid of Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* CPU */}
        <div className="bg-slate-900/60 border border-cyan-500/15 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> CPU LOAD</span>
            <span className="text-cyan-300 font-bold">{status.cpu.usagePercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, status.cpu.usagePercent)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-1">
            {status.cpu.cores} Cores @ {status.cpu.speedMhz} MHz
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-900/60 border border-cyan-500/15 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-cyan-400" /> RAM (12 GB PC)</span>
            <span className="text-cyan-300 font-bold">{status.memory.usagePercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, status.memory.usagePercent)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-1">
            {Math.round(status.memory.usedMb / 1024)} / {Math.round(status.memory.totalMb / 1024)} GB USED
          </div>
        </div>

        {/* Storage */}
        <div className="bg-slate-900/60 border border-cyan-500/15 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-cyan-400" /> C:\ DRIVE</span>
            <span className="text-cyan-300 font-bold">{status.disk.usagePercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${status.disk.usagePercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-1">
            {status.disk.freeGb} GB FREE / {status.disk.totalGb} GB
          </div>
        </div>

        {/* Network & Security Boundary */}
        <div className="bg-slate-900/60 border border-cyan-500/15 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> SECURITY</span>
            <span className="text-emerald-400 font-bold">L{securityLevel} ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-cyan-400" /> NET: {status.network.latencyMs}ms</span>
            <span className="flex items-center gap-1"><BatteryCharging className="w-3 h-3 text-amber-400" /> {status.battery.percent}%</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate mt-1">
            DEFENDER: ENFORCED
          </div>
        </div>
      </div>
    </div>
  );
};
