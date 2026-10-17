import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  Download,
  Copy,
  Save,
  Sparkles,
  Terminal,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCode,
  Package,
  BookOpen,
  Trash2,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { SavedPythonScript } from '../types';

export const PythonStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Active script state
  const [currentTitle, setCurrentTitle] = useState('Windows File Organizer & Clean-up Bot');
  const [currentDescription, setCurrentDescription] = useState('Automatically sorts files in Downloads directory into Images, Documents, Videos, and Code.');
  const [currentCode, setCurrentCode] = useState(`"""
JARVIS Autonomous Windows File Organizer
Categorizes Downloads folder by extension.
"""
import os
import shutil
from pathlib import Path

EXTENSIONS = {
    "Images": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"],
    "Documents": [".pdf", ".docx", ".txt", ".xlsx", ".pptx", ".csv"],
    "Audio_Video": [".mp3", ".wav", ".mp4", ".mkv", ".mov"],
    "Code_Archives": [".py", ".zip", ".tar.gz", ".json", ".html", ".css"],
}

def organize_folder(target_dir):
    path = Path(target_dir)
    print(f"[*] Scanning path: {path.resolve()}")
    stats = {cat: 0 for cat in EXTENSIONS}
    
    # Process files
    for item in path.iterdir():
        if item.is_file():
            ext = item.suffix.lower()
            for category, ext_list in EXTENSIONS.items():
                if ext in ext_list:
                    print(f"[+] Categorized: {item.name} -> {category}/")
                    stats[category] += 1
                    break
                    
    print("\\n[SUCCESS] File Organization scan completed.")
    for cat, count in stats.items():
        print(f" - {cat}: {count} files found")

if __name__ == "__main__":
    print("[JARVIS File Intelligence] Running organizer on workspace...")
    organize_folder(".")
`);
  const [currentPackages, setCurrentPackages] = useState<string[]>(['pathlib']);
  const [currentUrduExplanation, setCurrentUrduExplanation] = useState<string>(
    'Yeh program aapke computer ke folder ko scan karta hai aur files ko unki extension (jaise images, pdf, videos) ke mutabiq alag alag categories mein organize karta hai.'
  );

  // Terminal Execution State
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasExecuted, setHasExecuted] = useState(false);

  // Library of saved scripts
  const [savedScripts, setSavedScripts] = useState<SavedPythonScript[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [explanationLang, setExplanationLang] = useState<'ur' | 'en'>('ur');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Load saved scripts on mount
  const loadSavedScripts = () => {
    fetch('/api/python/scripts')
      .then((res) => res.json())
      .then((data) => {
        if (data.scripts) setSavedScripts(data.scripts);
      })
      .catch((err) => console.error('Failed to load scripts:', err));
  };

  useEffect(() => {
    loadSavedScripts();
  }, []);

  // Quick preset suggestions
  const presetPrompts = [
    { label: '🎮 Snake Game Logic', query: 'Write a full terminal or pygame-ready Snake game with food, score tracking, and collision detection in Python.' },
    { label: '📁 Auto File Organizer', query: 'Write a Python script that organizes files in a target directory by file type into dedicated folders.' },
    { label: '🌐 Web Data Scraper', query: 'Create a Python web scraper using BeautifulSoup and requests to extract article titles and links safely.' },
    { label: '📊 Data Statistics Engine', query: 'Build a Python statistical analyzer that computes mean, median, standard deviation, and frequency distribution for a dataset.' },
    { label: '🔐 Password & Token Generator', query: 'Create a secure cryptographic password and API token generator with customizable length, symbols, and entropy score.' },
    { label: '⚡ CPU Speed Benchmark', query: 'Create a high-performance CPU prime number and floating-point benchmark script that calculates throughput in Python.' },
  ];

  // Generate code with Gemini
  const handleGenerateCode = async (promptText: string) => {
    const finalPrompt = promptText || prompt;
    if (!finalPrompt.trim()) return;

    setIsGenerating(true);
    notify('Synthesizing Python program with Gemini AI...');

    try {
      const res = await fetch('/api/python/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      const data = await res.json();

      if (data.script) {
        setCurrentTitle(data.script.title);
        setCurrentDescription(data.script.description);
        setCurrentCode(data.script.code);
        setCurrentPackages(data.script.packages || []);
        setCurrentUrduExplanation(data.script.urduExplanation || 'Program safalata se tayar ho chuka hai.');
        setStdout('');
        setStderr('');
        setExitCode(null);
        setExecutionTime(null);
        setHasExecuted(false);
        notify('Python program synthesized! Click "Run Code" to test.');
      } else {
        notify('Failed to generate program. Try again.');
      }
    } catch (err: any) {
      notify(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Execute code via sandboxed Python 3 subprocess
  const handleRunCode = async () => {
    setIsExecuting(true);
    setStdout('');
    setStderr('');
    setHasExecuted(false);

    try {
      const res = await fetch('/api/python/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode }),
      });
      const data = await res.json();

      setStdout(data.stdout || '');
      setStderr(data.stderr || '');
      setExitCode(data.exitCode ?? (data.success ? 0 : 1));
      setExecutionTime(data.executionTimeMs ?? 0);
      setHasExecuted(true);

      if (data.success) {
        notify(`Execution successful in ${data.executionTimeMs}ms (Exit 0)`);
      } else {
        notify(`Script finished with errors (Exit ${data.exitCode})`);
      }
    } catch (err: any) {
      setStderr(`Execution failed: ${err.message}`);
      setExitCode(1);
      setHasExecuted(true);
    } finally {
      setIsExecuting(false);
    }
  };

  // Save current script to library
  const handleSaveScript = async () => {
    try {
      const res = await fetch('/api/python/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          description: currentDescription,
          code: currentCode,
          packages: currentPackages,
          urduExplanation: currentUrduExplanation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Saved "${currentTitle}" to Python script library.`);
        loadSavedScripts();
      }
    } catch (err: any) {
      notify(`Save error: ${err.message}`);
    }
  };

  // Download .py file
  const handleDownloadPy = () => {
    const filename = currentTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() + '.py';
    const blob = new Blob([currentCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify(`Downloaded ${filename}`);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    notify('Python code copied to clipboard!');
  };

  // Load a script from library
  const handleLoadScript = (script: SavedPythonScript) => {
    setCurrentTitle(script.title);
    setCurrentDescription(script.description);
    setCurrentCode(script.code);
    setCurrentPackages(script.packages || []);
    setCurrentUrduExplanation(script.urduExplanation || '');
    setStdout('');
    setStderr('');
    setExitCode(null);
    setExecutionTime(null);
    setHasExecuted(false);
    notify(`Loaded "${script.title}"`);
  };

  // Delete script
  const handleDeleteScript = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/python/scripts/${id}`, { method: 'DELETE' });
      setSavedScripts((prev) => prev.filter((s) => s.id !== id));
      notify('Script removed from library.');
    } catch (err: any) {
      notify(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 md:p-5 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col gap-4 shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-cyan-300 uppercase text-xs sm:text-sm">
                UNIVERSAL PYTHON STUDIO & CODE ENGINE
              </span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                PYTHON 3.10 READY
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-0.5 font-sans">
              کوئی بھی پائتھن پروگرام بنائیں، چلائیں اور ڈاؤن لوڈ کریں — Write, Synthesize & Run Any Python Program
            </div>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-200 text-[11px] animate-fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* AI Synthesis Prompt Section */}
      <div className="bg-slate-900/70 border border-cyan-500/20 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-slate-300 text-[11px]">
          <span className="flex items-center gap-1.5 font-bold text-cyan-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI Python Generator (انگریزی یا اردو میں فرمائش کریں)
          </span>
          <span className="text-[10px] text-slate-500">Autonomous Code Synthesis</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateCode(prompt)}
            placeholder="Describe any program (e.g., 'Ek scientific calculator banao', 'Snake game', 'Automate Excel file sorting')..."
            className="flex-1 bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button
            onClick={() => handleGenerateCode(prompt)}
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)] min-w-[150px]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>SYNTHESIZING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>BUILD PROGRAM</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 font-semibold">PRESETS:</span>
          {presetPrompts.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setPrompt(preset.query);
                handleGenerateCode(preset.query);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/20 text-cyan-300 hover:text-cyan-100 text-[10px] transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Split: Code Editor (Left) & Terminal / Saved Scripts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Code Editor & Metadata (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3.5 space-y-3">
          {/* Script Title & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <div className="font-bold text-cyan-300 text-xs truncate max-w-sm">
                {currentTitle}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-1">{currentDescription}</div>
            </div>

            {/* Editor Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] text-[11px]"
                title="Execute program in Python 3.10 sandbox"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'RUNNING...' : 'RUN CODE'}</span>
              </button>
              <button
                onClick={handleSaveScript}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-[10px] cursor-pointer"
                title="Save script to local library"
              >
                <Save className="w-3 h-3 text-cyan-400" />
                <span>SAVE</span>
              </button>
              <button
                onClick={handleDownloadPy}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-[10px] cursor-pointer"
                title="Download as standalone .py file"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>.PY</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Copy code to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Python Code Editor */}
          <div className="relative flex-1 bg-slate-950 border border-cyan-500/25 rounded-lg overflow-hidden flex">
            {/* Line Number Counter */}
            <div className="w-9 bg-slate-900/90 py-2.5 text-right pr-2 text-[10px] text-slate-600 select-none font-mono border-r border-slate-800">
              {currentCode.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Codearea */}
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent p-2.5 text-[11px] font-mono text-cyan-100 focus:outline-none resize-none leading-relaxed min-h-[300px] overflow-x-auto whitespace-pre"
            />
          </div>

          {/* Required Packages Badge */}
          {currentPackages.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">Dependencies:</span>
              <div className="flex gap-1.5 flex-wrap">
                {currentPackages.map((pkg) => (
                  <span key={pkg} className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20 font-mono">
                    pip install {pkg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bilingual Code Explanation (Urdu & English) */}
          <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                HOW THIS PROGRAM WORKS (وضاحت)
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
                ? currentUrduExplanation
                : currentDescription}
            </p>
          </div>
        </div>

        {/* Right Column: Execution Terminal & Saved Scripts (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Live Execution Terminal */}
          <div className="flex-1 bg-slate-900/70 border border-cyan-500/20 rounded-xl p-3.5 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-xs">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>TERMINAL OUTPUT (CONSOLE)</span>
              </div>

              {hasExecuted && (
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {executionTime}ms
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold ${
                      exitCode === 0
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-950 text-red-400 border border-red-500/30'
                    }`}
                  >
                    EXIT {exitCode}
                  </span>
                </div>
              )}
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 bg-black/90 border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-y-auto max-h-60 min-h-[180px] leading-relaxed">
              {isExecuting ? (
                <div className="text-cyan-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing script in isolated Python 3 sandbox...</span>
                </div>
              ) : stdout || stderr ? (
                <div>
                  {stdout && <div className="text-emerald-300 whitespace-pre-wrap">{stdout}</div>}
                  {stderr && <div className="text-red-400 whitespace-pre-wrap mt-1">{stderr}</div>}
                </div>
              ) : (
                <div className="text-slate-600 flex flex-col items-center justify-center h-full py-8 text-center">
                  <Terminal className="w-6 h-6 mb-1 opacity-40" />
                  <span>Terminal ready. Click "RUN CODE" to execute.</span>
                </div>
              )}
            </div>
          </div>

          {/* Saved Scripts Library Drawer */}
          <div className="bg-slate-900/70 border border-cyan-500/20 rounded-xl p-3.5 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-xs">
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span>PYTHON SCRIPT LIBRARY</span>
              </div>
              <span className="text-[10px] text-slate-500">{savedScripts.length} SCRIPTS</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {savedScripts.map((script) => (
                <div
                  key={script.id}
                  onClick={() => handleLoadScript(script)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    currentTitle === script.title
                      ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-[11px] truncate">{script.title}</div>
                      <div className="text-[9px] text-slate-500 truncate">{script.description}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteScript(script.id, e)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1 cursor-pointer shrink-0"
                    title="Delete script from library"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
