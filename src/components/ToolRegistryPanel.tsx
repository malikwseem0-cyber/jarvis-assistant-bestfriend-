import React, { useState, useEffect } from 'react';
import { Wrench, Shield, CheckCircle, AlertOctagon, Terminal, Play } from 'lucide-react';
import { ToolDefinition } from '../types';

export const ToolRegistryPanel: React.FC = () => {
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [toolParams, setToolParams] = useState<Record<string, string>>({});
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetch('/api/tools')
      .then((res) => res.json())
      .then((data) => {
        if (data.tools) {
          setTools(data.tools);
          if (data.tools.length > 0) setSelectedTool(data.tools[0]);
        }
      })
      .catch((err) => console.error('Failed to load tools:', err));
  }, []);

  const handleSelectTool = (tool: ToolDefinition) => {
    setSelectedTool(tool);
    setExecutionResult(null);
    const initialParams: Record<string, string> = {};
    Object.keys(tool.parameters).forEach((k) => {
      if (k === 'appName') initialParams[k] = 'Calculator';
      else if (k === 'level') initialParams[k] = '50';
      else if (k === 'query') initialParams[k] = 'main.py';
      else if (k === 'path') initialParams[k] = 'C:\\JARVIS\\demo.txt';
      else initialParams[k] = '';
    });
    setToolParams(initialParams);
  };

  const handleRunTool = async (forceApprove = false) => {
    if (!selectedTool) return;
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedTool.id,
          params: toolParams,
          approved: forceApprove || selectedTool.level < 2,
        }),
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const categories = ['All', 'Operating System', 'Files and Folders', 'Productivity', 'Development'];
  const filteredTools = tools.filter((t) => filterCategory === 'All' || t.category === filterCategory);

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider text-cyan-300 uppercase text-[11px]">
            MODULAR TOOL DIRECTORY & PERMISSION GATE
          </span>
          <span className="bg-slate-800 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20">
            {tools.length} REGISTERED
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono transition-colors cursor-pointer ${
              filterCategory === c
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid: Tools catalog on left, execution sandbox on right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-[220px]">
        {/* Tool List */}
        <div className="space-y-1.5 overflow-y-auto max-h-60 pr-1">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleSelectTool(tool)}
              className={`p-2 rounded-xl border cursor-pointer transition-all ${
                selectedTool?.id === tool.id
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-[11px] truncate">{tool.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    tool.level === 0
                      ? 'bg-slate-800 text-slate-400'
                      : tool.level === 1
                      ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                      : tool.level === 2
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      : 'bg-red-950 text-red-400 border border-red-500/30'
                  }`}
                >
                  LEVEL {tool.level}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{tool.description}</p>
            </div>
          ))}
        </div>

        {/* Execution Inspector & Live Test Runner */}
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-3 flex flex-col justify-between">
          {selectedTool ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-cyan-300 text-xs">{selectedTool.name}</div>
                  <div className="text-[10px] text-slate-400">ID: {selectedTool.id} | {selectedTool.category}</div>
                </div>
                <div
                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
                    selectedTool.level >= 2
                      ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>Level {selectedTool.level} Policy</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800">
                {selectedTool.description}
              </div>

              {/* Parameter Inputs */}
              {Object.keys(selectedTool.parameters).length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">PARAMETERS</div>
                  {Object.entries(selectedTool.parameters).map(([paramName, paramType]) => (
                    <div key={paramName} className="flex items-center gap-2">
                      <span className="text-[10px] text-cyan-400 min-w-[70px]">{paramName}:</span>
                      <input
                        type="text"
                        value={toolParams[paramName] || ''}
                        onChange={(e) => setToolParams({ ...toolParams, [paramName]: e.target.value })}
                        placeholder={paramType}
                        className="flex-1 bg-slate-950 border border-cyan-500/25 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Execution Outcome */}
              {executionResult && (
                <div className="bg-slate-950 rounded p-2 text-[10px] border border-slate-800 max-h-24 overflow-y-auto">
                  {executionResult.requiresApproval ? (
                    <div className="text-amber-400 flex items-center gap-1.5 font-bold">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>{executionResult.error}</span>
                    </div>
                  ) : executionResult.success ? (
                    <div className="space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Execution Successful
                      </div>
                      <pre className="text-slate-300 whitespace-pre-wrap">
                        {JSON.stringify(executionResult.result, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-red-400">{executionResult.error || 'Execution failed'}</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 p-4">Select a tool to test.</div>
          )}

          {/* Action button */}
          {selectedTool && (
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              {selectedTool.level >= 2 && executionResult?.requiresApproval && (
                <button
                  onClick={() => handleRunTool(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded cursor-pointer text-xs"
                >
                  Confirm & Run
                </button>
              )}
              <button
                onClick={() => handleRunTool(false)}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded cursor-pointer text-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Execution</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
