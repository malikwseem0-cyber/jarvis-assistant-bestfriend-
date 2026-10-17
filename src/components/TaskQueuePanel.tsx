import React from 'react';
import { Play, CheckCircle2, AlertTriangle, XOctagon, ShieldAlert, Terminal, ArrowRight } from 'lucide-react';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  status: 'pending' | 'awaiting_approval' | 'in_progress' | 'completed' | 'cancelled';
  level: number;
  toolTarget?: string;
  consequences?: string;
}

interface TaskQueuePanelProps {
  tasks: TaskItem[];
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
  onKillSwitch: () => void;
}

export const TaskQueuePanel: React.FC<TaskQueuePanelProps> = ({
  tasks,
  onApproveTask,
  onRejectTask,
  onKillSwitch,
}) => {
  const pendingApprovals = tasks.filter((t) => t.status === 'awaiting_approval');

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-md font-mono text-xs text-slate-200">
      {/* Header with Kill Switch */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider text-cyan-300 uppercase text-[11px]">
            AUTONOMOUS TASK PLANNER & QUEUE
          </span>
          <span className="bg-slate-800 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20">
            {tasks.length} DIRECTIVES
          </span>
        </div>

        {/* Emergency Kill Switch */}
        <button
          onClick={onKillSwitch}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
          title="Emergency Abort All Running Subsystems"
        >
          <XOctagon className="w-3.5 h-3.5 text-red-400" />
          <span>KILL SWITCH</span>
        </button>
      </div>

      {/* Security Approval Gate Modal if awaiting approval */}
      {pendingApprovals.length > 0 && (
        <div className="mb-4 bg-amber-950/40 border border-amber-500/50 rounded-xl p-3 text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-400 mb-1 text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>SECURITY LEVEL {pendingApprovals[0].level} APPROVAL REQUIRED</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2">
            Target: <span className="font-semibold text-cyan-300">{pendingApprovals[0].title}</span>
          </p>
          <div className="bg-slate-950/90 border border-amber-500/30 rounded p-2 text-[10px] text-amber-300/90 mb-3">
            <span className="font-semibold text-amber-400">Audited Impact: </span>
            {pendingApprovals[0].consequences || 'Modifies designated desktop state or runs a sandboxed tool.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApproveTask(pendingApprovals[0].id)}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-1.5 px-3 rounded transition-colors text-center cursor-pointer"
            >
              Authorize Action
            </button>
            <button
              onClick={() => onRejectTask(pendingApprovals[0].id)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
            >
              Deny
            </button>
          </div>
        </div>
      )}

      {/* Task Queue List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-2.5 rounded-xl border transition-all ${
              task.status === 'in_progress'
                ? 'bg-cyan-950/30 border-cyan-500/40'
                : task.status === 'completed'
                ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                : task.status === 'awaiting_approval'
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : task.status === 'in_progress' ? (
                  <Play className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : task.status === 'awaiting_approval' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="text-[11px] truncate">{task.title}</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                  task.level === 0
                    ? 'bg-slate-800 text-slate-400'
                    : task.level === 1
                    ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                    : task.level === 2
                    ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    : 'bg-red-950 text-red-400 border border-red-500/30'
                }`}
              >
                LEVEL {task.level}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pl-5">{task.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
