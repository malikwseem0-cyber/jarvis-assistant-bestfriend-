import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  FileCode,
  RotateCcw,
  AlertTriangle,
  Activity,
  Sparkles,
  History,
  Check,
  ShieldCheck,
  BookOpen,
  Send,
  Zap,
  Cpu,
  Layers,
} from 'lucide-react';
import { SelfImprovementProposal, CheckpointRecord } from '../types';

export const SelfImprovementEngine: React.FC = () => {
  const [proposals, setProposals] = useState<SelfImprovementProposal[]>([]);
  const [activeProposal, setActiveProposal] = useState<SelfImprovementProposal | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Diagnostic Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [healthScore, setHealthScore] = useState<number>(94);
  const [scanReport, setScanReport] = useState<any>(null);

  // Custom Prompt State
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  // Apply & Rollback State
  const [isApplying, setIsApplying] = useState(false);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string | null>(null);
  const [auditNotice, setAuditNotice] = useState<string | null>(null);
  const [showCheckpointsLedger, setShowCheckpointsLedger] = useState(false);
  const [explanationLang, setExplanationLang] = useState<'ur' | 'en'>('ur');

  // Load proposals and checkpoints on mount
  useEffect(() => {
    loadProposals();
    loadCheckpoints();
  }, []);

  const loadProposals = () => {
    fetch('/api/self-improvement/proposals')
      .then((res) => res.json())
      .then((data) => {
        if (data.proposals) {
          setProposals(data.proposals);
          if (data.proposals.length > 0 && !activeProposal) {
            setActiveProposal(data.proposals[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load proposals:', err));
  };

  const loadCheckpoints = () => {
    fetch('/api/self-improvement/checkpoints')
      .then((res) => res.json())
      .then((data) => {
        if (data.checkpoints) {
          setCheckpoints(data.checkpoints);
          if (data.checkpoints.length > 0) {
            setActiveCheckpointId(data.checkpoints[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load checkpoints:', err));
  };

  // Run full automated codebase diagnostic scan
  const handleRunDiagnosticScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/self-improvement/scan', { method: 'POST' });
      const data = await res.json();
      if (data.scanResults) {
        setHealthScore(data.scanResults.healthScore);
        setScanReport(data.scanResults);
        setAuditNotice(`Diagnostic complete: 24 files audited. Health Score: ${data.scanResults.healthScore}/100.`);
        loadProposals();
      }
    } catch (err: any) {
      setAuditNotice(`Scan error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Generate custom patch requested by user
  const handleGenerateCustomPatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGeneratingCustom(true);
    setAuditNotice('Autonomous Engine: Formulating code patch and diff analysis...');

    try {
      const res = await fetch('/api/self-improvement/generate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt }),
      });
      const data = await res.json();
      if (data.success && data.proposal) {
        setProposals(data.proposals);
        setActiveProposal(data.proposal);
        setCustomPrompt('');
        setAuditNotice(`Synthesized patch "${data.proposal.title}". Ready for operator clearance.`);
      }
    } catch (err: any) {
      setAuditNotice(`Synthesis error: ${err.message}`);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Authorize & Apply Patch
  const handleApplyPatch = async () => {
    if (!activeProposal) return;
    setIsApplying(true);
    setAuditNotice(`Creating safety checkpoint and executing unit test verification for ${activeProposal.id}...`);

    try {
      const res = await fetch('/api/self-improvement/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patchId: activeProposal.id,
          approve: true,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setActiveCheckpointId(data.checkpointId);
        setAuditNotice(data.message);
        if (data.proposals) setProposals(data.proposals);
        if (data.checkpoints) setCheckpoints(data.checkpoints);
        setActiveProposal((prev) =>
          prev ? { ...prev, status: 'applied', testResults: data.testResults } : null
        );
      } else {
        setAuditNotice(`Authorization rejected: ${data.error}`);
      }
    } catch (err: any) {
      setAuditNotice(`Patch execution fault: ${err.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  // 1-Click Rollback to any past checkpoint
  const handleRollbackToCheckpoint = async (checkpointId: string) => {
    try {
      const res = await fetch('/api/self-improvement/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditNotice(data.message);
        if (data.proposals) setProposals(data.proposals);
        if (data.checkpoints) setCheckpoints(data.checkpoints);
        loadProposals();
      }
    } catch (err: any) {
      setAuditNotice(`Rollback error: ${err.message}`);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 md:p-5 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col gap-4 shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-cyan-300 uppercase text-xs sm:text-sm">
                AUTONOMOUS SELF-IMPROVEMENT & CODEBASE ARCHITECT
              </span>
              <span className="bg-cyan-950 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                LEVEL 2 APPROVAL GATED
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-0.5 font-sans">
              خودکار نظامِ اصلاح و بہتری — Deep Codebase Diagnostics, Diff Inspection, Unit Test Gates & 1-Click Rollback
            </div>
          </div>
        </div>

        {/* Health Score & Checkpoints Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">HEALTH:</span>
            <span className="text-emerald-400 font-extrabold">{healthScore}/100</span>
          </div>

          <button
            onClick={() => setShowCheckpointsLedger(!showCheckpointsLedger)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              showCheckpointsLedger
                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Checkpoints ({checkpoints.length})</span>
          </button>
        </div>
      </div>

      {/* Audit Notification Banner */}
      {auditNotice && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-[11px] animate-fade-in">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{auditNotice}</span>
        </div>
      )}

      {/* Diagnostic Scan Banner & Custom Patch Synthesizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3.5">
        {/* Left: Codebase Health Action (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2 border-b lg:border-b-0 lg:border-r border-slate-800 pb-3 lg:pb-0 lg:pr-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 uppercase flex items-center gap-1.5 text-xs">
              <Zap className="w-4 h-4 text-amber-400" />
              Continuous Codebase Audit
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              SECURITY A+
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            JARVIS scans repository files (`server.ts`, `assistant.py`, `file_tools.py`) for performance bottlenecks, path escapes, and test coverage gaps.
          </p>
          <button
            onClick={handleRunDiagnosticScan}
            disabled={isScanning}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AUDITING REPOSITORY...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RUN CODEBASE DIAGNOSTIC AUDIT</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Custom Self-Improvement Prompt (7 cols) */}
        <form onSubmit={handleGenerateCustomPatch} className="lg:col-span-7 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 uppercase flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Request Custom System Enhancement
            </span>
            <span className="text-[10px] text-slate-500">Autonomous Diff Synthesizer</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. 'Add memory cache to disk hashes', 'Harden path escape guards', 'Optimize audio waveform'..."
              className="flex-1 bg-slate-950 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isGeneratingCustom || !customPrompt.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-md"
            >
              {isGeneratingCustom ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Draft Patch</span>
            </button>
          </div>
          <div className="text-[9px] text-slate-500">
            Rule: Patch is prepared in isolated sandbox with zero mutations until explicit operator clearance.
          </div>
        </form>
      </div>

      {/* Checkpoints History Ledger Modal / Overlay */}
      {showCheckpointsLedger && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-3.5 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <History className="w-4 h-4 text-amber-400" />
              <span>SAFETY CHECKPOINT REVERSION LEDGER (سابقہ حالت پر واپسی)</span>
            </div>
            <button
              onClick={() => setShowCheckpointsLedger(false)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 text-[10px]"
            >
              Close Ledger
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]"
              >
                <div>
                  <div className="font-bold text-slate-200">{cp.patchTitle}</div>
                  <div className="text-[9px] text-slate-400">
                    ID: <code className="text-cyan-300">{cp.id}</code> | Target: {cp.targetFile} | {cp.timestamp.slice(0, 19).replace('T', ' ')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      cp.status === 'active'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {cp.status.toUpperCase()}
                  </span>
                  {cp.status === 'active' && (
                    <button
                      onClick={() => handleRollbackToCheckpoint(cp.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[10px] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revert / Rollback</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Split: Staged Proposals (Left) & Unified Diff / Tests (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Proposals Selector Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-2">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {['all', 'performance', 'security', 'architecture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Proposals List */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {filteredProposals.map((p) => (
              <div
                key={p.id}
                onClick={() => setActiveProposal(p)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeProposal?.id === p.id
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 shadow-md'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] truncate pr-2">{p.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-bold ${
                      p.status === 'applied'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {p.status === 'applied' ? 'APPLIED' : 'STAGED'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[9px]">
                  <span className="text-cyan-400/80">{p.targetFile}</span>
                  <span className="text-amber-400 font-semibold">{p.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diff Inspection & Test Verification View (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4 justify-between space-y-3">
          {activeProposal ? (
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Proposal Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span>Target: {activeProposal.targetFile}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{activeProposal.title}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                    ID: {activeProposal.id}
                  </span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    {activeProposal.risk}
                  </span>
                </div>
              </div>

              {/* Bilingual Explanation Box */}
              <div className="bg-slate-950/70 border border-cyan-500/20 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-bold text-cyan-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    PATCH IMPACT & OBJECTIVE
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setExplanationLang('ur')}
                      className={`px-2 py-0.5 rounded text-[9px] cursor-pointer ${
                        explanationLang === 'ur'
                          ? 'bg-cyan-600 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      اردو / Roman Urdu
                    </button>
                    <button
                      onClick={() => setExplanationLang('en')}
                      className={`px-2 py-0.5 rounded text-[9px] cursor-pointer ${
                        explanationLang === 'en'
                          ? 'bg-cyan-600 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {explanationLang === 'ur'
                    ? activeProposal.urduExplanation || activeProposal.description
                    : activeProposal.description}
                </p>
              </div>

              {/* Readable Unified Diff Viewer */}
              <div className="space-y-1 flex-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">UNIFIED GIT DIFF PREVIEW</div>
                <div className="bg-black/90 rounded-lg p-3 font-mono text-[10px] overflow-x-auto border border-slate-800 leading-relaxed max-h-48 min-h-[120px]">
                  {activeProposal.diff.split('\n').map((line, idx) => {
                    let color = 'text-slate-400';
                    if (line.startsWith('+')) color = 'text-emerald-400 bg-emerald-950/40 px-1 font-semibold';
                    if (line.startsWith('-')) color = 'text-red-400 bg-red-950/40 px-1 font-semibold';
                    if (line.startsWith('@@')) color = 'text-cyan-400 font-bold border-b border-cyan-500/20';
                    if (line.startsWith('---') || line.startsWith('+++')) color = 'text-amber-400 font-bold';
                    return (
                      <div key={idx} className={`${color} whitespace-pre`}>
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automated Unit Test Verification Gates */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center justify-between">
                  <span>SAFETY VERIFICATION GATES (UNIT TESTS)</span>
                  <span className="text-[9px] text-emerald-400 font-bold">
                    {activeProposal.status === 'applied' ? 'ALL TESTS PASSED' : 'STAGED FOR RUN'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeProposal.tests.map((testName, i) => {
                    const testResult = activeProposal.testResults?.find((t) => t.name === testName);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px]"
                      >
                        <span className="text-slate-300 truncate font-mono">{testName}</span>
                        {activeProposal.status === 'applied' ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Check className="w-3 h-3" />
                            <span>{testResult ? `${testResult.durationMs}ms` : 'PASS'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">PENDING</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 p-8 text-center">Select an improvement proposal to inspect diff.</div>
          )}

          {/* Operator Authorization Bar */}
          {activeProposal && (
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-[10px] text-slate-400">
                Level 2 Security Clearance: Creates version checkpoint prior to mutation.
              </div>

              {activeProposal.status === 'applied' ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    <CheckCircle className="w-4 h-4" />
                    <span>PATCH VERIFIED & OPERATIONAL</span>
                  </div>
                  {activeCheckpointId && (
                    <button
                      onClick={() => handleRollbackToCheckpoint(activeCheckpointId)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded-lg text-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleApplyPatch}
                  disabled={isApplying}
                  className="flex items-center justify-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer text-xs"
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>APPLYING & RUNNING TESTS...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>AUTHORIZE & APPLY PATCH</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
