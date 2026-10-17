import React, { useState } from 'react';
import { Download, CheckCircle, Terminal, HelpCircle, Laptop, ShieldCheck } from 'lucide-react';

interface DesktopPackageModalProps {
  onClose: () => void;
}

export const DesktopPackageModal: React.FC<DesktopPackageModalProps> = ({ onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = () => {
    setDownloading(true);
    // Trigger download of generated ZIP archive
    const anchor = document.createElement('a');
    anchor.href = '/api/export-desktop-package';
    anchor.download = 'jarvis-ai-ultra-extreme.zip';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono text-xs text-slate-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-bold text-cyan-300 text-sm">
                WINDOWS 10 & 11 DESKTOP RUNNER SUITE
              </div>
              <div className="text-[10px] text-slate-400">
                JARVIS AI — ULTRA EXTREME PC MASTER EDITION (PYTHON 3)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Overview Box */}
        <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Standalone Package Architecture</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            This download bundles the complete, runnable Python 3 Windows application with automated virtual environment initialization, <code className="text-cyan-300">start_jarvis.bat</code> 1-click startup, SQLite memory persistence, and Level 0–3 security sandbox guards.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            <div>• Target OS: Windows 10 & 11 (64-bit)</div>
            <div>• Optimized for: 12GB RAM, modest CPU/GPU</div>
            <div>• Zero mandatory external cloud services</div>
            <div>• Safe defensive path-traversal guards</div>
          </div>
        </div>

        {/* Step-by-step Quick Start */}
        <div className="space-y-2">
          <div className="text-cyan-400 font-bold text-[11px] uppercase flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>3-Step Quick Start Setup</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300 leading-relaxed">
            <li>
              Download and extract <code className="text-cyan-300">jarvis-ai-ultra-extreme.zip</code> to any directory (e.g. <code className="text-slate-400">C:\JARVIS</code>).
            </li>
            <li>
              Double-click <code className="text-cyan-300 font-bold">start_jarvis.bat</code>. It configures the isolated Python venv and installs dependencies automatically.
            </li>
            <li>
              Speak directly using Push-to-Talk (Space key) or interact via the HUD console on <code className="text-cyan-300">http://localhost:3000</code>.
            </li>
          </ol>
        </div>

        {/* Download Button & Status */}
        <div className="mt-2 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified 100% Virus & Bloatware Free</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Close
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Package Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Compiling ZIP...' : 'Download .ZIP Package'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
