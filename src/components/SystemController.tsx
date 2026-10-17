import React, { useState, useRef } from 'react';
import {
  MousePointer,
  Keyboard,
  Shield,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle,
  Terminal,
  Monitor,
  Volume2,
  Lock,
  AppWindow,
  Download,
  Copy,
  Zap,
} from 'lucide-react';

export const SystemController: React.FC = () => {
  // Virtual Mouse State
  const [cursorPos, setCursorPos] = useState({ x: 960, y: 540 });
  const [mouseClickStatus, setMouseClickStatus] = useState<string | null>(null);
  const [trackpadActive, setTrackpadActive] = useState<boolean>(false);

  // Virtual Keyboard State
  const [customText, setCustomText] = useState('');
  const [actionHistory, setActionHistory] = useState<string[]>([
    'Virtual Input Subsystem armed.',
    'Mouse cursor calibrated to 1920x1080 virtual desktop.',
  ]);

  // Trackpad movement
  const handleTrackpadMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const screenX = Math.round(relX * 1920);
    const screenY = Math.round(relY * 1080);
    setCursorPos({ x: screenX, y: screenY });
  };

  const dispatchMouseAction = async (action: 'move' | 'left_click' | 'right_click' | 'double_click' | 'scroll_up' | 'scroll_down') => {
    setMouseClickStatus(action);
    setTimeout(() => setMouseClickStatus(null), 400);

    const logEntry = `[MOUSE] Action: ${action.toUpperCase()} at (${cursorPos.x}, ${cursorPos.y})`;
    setActionHistory((prev) => [logEntry, ...prev.slice(0, 15)]);

    // Call server tool
    try {
      await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'mouse_control',
          params: { action, x: cursorPos.x, y: cursorPos.y },
          approved: true,
        }),
      });
    } catch (err) {
      console.warn('Mouse action error:', err);
    }
  };

  const dispatchHotkey = async (hotkeyName: string, keys: string) => {
    const logEntry = `[KEYBOARD] Dispatched Hotkey: ${hotkeyName} (${keys})`;
    setActionHistory((prev) => [logEntry, ...prev.slice(0, 15)]);

    try {
      await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'keyboard_send',
          params: { hotkey: keys },
          approved: true,
        }),
      });
    } catch (err) {
      console.warn('Keyboard action error:', err);
    }
  };

  const dispatchCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const logEntry = `[KEYBOARD] Typed String: "${customText}"`;
    setActionHistory((prev) => [logEntry, ...prev.slice(0, 15)]);

    try {
      await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'keyboard_send',
          params: { keys: customText },
          approved: true,
        }),
      });
    } catch {}

    setCustomText('');
  };

  // Python PyAutoGUI script code sample
  const pythonScriptCode = `"""
JARVIS Autonomous Windows Input Automation (pyautogui)
Controls mouse coordinates, clicks, and keystrokes on Windows 10/11.
"""
import pyautogui
import time

pyautogui.FAILSAFE = True # Move mouse to upper-left corner to abort

def automated_sequence():
    print("[*] Screen resolution:", pyautogui.size())
    # Smooth mouse move
    print(f"[*] Moving to target ({cursorPos.x}, {cursorPos.y})...")
    pyautogui.moveTo(${cursorPos.x}, ${cursorPos.y}, duration=0.5)
    
    # Left click
    pyautogui.click()
    print("[+] Click triggered.")
    
    # Send simulated keystroke
    pyautogui.write("Hello from JARVIS AI!", interval=0.05)
    pyautogui.press("enter")

if __name__ == "__main__":
    automated_sequence()
`;

  const handleDownloadAutomationScript = () => {
    const blob = new Blob([pythonScriptCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jarvis_windows_controller.py';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 md:p-5 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col gap-4 shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <MousePointer className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-cyan-300 uppercase text-xs sm:text-sm">
                FULL SYSTEM MOUSE & KEYBOARD CONTROLLER
              </span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                PYAUTOGUI DRIVER ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-0.5 font-sans">
              ماؤس اور کی بورڈ کنٹرولر — Virtual Trackpad, Hotkeys, Keystroke Simulator & Windows Automation
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-cyan-500/30 text-[11px] text-cyan-300">
          <Monitor className="w-3.5 h-3.5 text-cyan-400" />
          <span>CURSOR: X: {cursorPos.x} | Y: {cursorPos.y}</span>
        </div>
      </div>

      {/* Grid: Virtual Trackpad (Left) & Keyboard Hotkeys (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Virtual Trackpad & Mouse Buttons (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-300 uppercase flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
              1. VIRTUAL TOUCHPAD (1920 x 1080)
            </span>
            <span className="text-[10px] text-slate-500">Move cursor in real-time</span>
          </div>

          {/* Interactive Trackpad Surface */}
          <div
            onMouseMove={handleTrackpadMove}
            onClick={() => dispatchMouseAction('left_click')}
            onContextMenu={(e) => {
              e.preventDefault();
              dispatchMouseAction('right_click');
            }}
            className="relative h-56 bg-slate-950 border border-cyan-500/40 rounded-xl cursor-crosshair overflow-hidden select-none shadow-inner flex items-center justify-center group"
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff10_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff10_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

            {/* Simulated Desktop Cursor */}
            <div
              className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
              style={{
                left: `${(cursorPos.x / 1920) * 100}%`,
                top: `${(cursorPos.y / 1080) * 100}%`,
              }}
            >
              <MousePointer className="w-4 h-4 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            </div>

            <div className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none text-center">
              <div>MOVE MOUSE HERE TO DIRECT CURSOR</div>
              <div className="text-[9px] text-cyan-400/60 mt-0.5">Left-click: Click | Right-click: Context Menu</div>
            </div>
          </div>

          {/* Mouse Buttons Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => dispatchMouseAction('left_click')}
              className={`py-2 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                mouseClickStatus === 'left_click'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                  : 'bg-slate-950 border-slate-700 hover:bg-slate-800 text-cyan-300'
              }`}
            >
              LEFT CLICK
            </button>
            <button
              onClick={() => dispatchMouseAction('right_click')}
              className={`py-2 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                mouseClickStatus === 'right_click'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                  : 'bg-slate-950 border-slate-700 hover:bg-slate-800 text-cyan-300'
              }`}
            >
              RIGHT CLICK
            </button>
            <button
              onClick={() => dispatchMouseAction('double_click')}
              className={`py-2 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                mouseClickStatus === 'double_click'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                  : 'bg-slate-950 border-slate-700 hover:bg-slate-800 text-cyan-300'
              }`}
            >
              2x CLICK
            </button>
            <button
              onClick={() => dispatchMouseAction('scroll_down')}
              className="py-2 rounded-lg font-bold text-[11px] bg-slate-950 border border-slate-700 hover:bg-slate-800 text-cyan-300 transition-all cursor-pointer"
            >
              SCROLL ↓
            </button>
          </div>
        </div>

        {/* Right Column: Keyboard Hotkeys & String Dispatcher (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-300 uppercase flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              2. WINDOWS HOTKEYS & KEYSTROKES
            </span>
            <span className="text-[10px] text-slate-500">System Directives</span>
          </div>

          {/* Quick Windows Hotkey Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: 'Show Desktop', combo: 'Win + D', icon: Monitor },
              { label: 'Switch App', combo: 'Alt + Tab', icon: AppWindow },
              { label: 'File Explorer', combo: 'Win + E', icon: Monitor },
              { label: 'Task Manager', combo: 'Ctrl+Shift+Esc', icon: Zap },
              { label: 'Copy Buffer', combo: 'Ctrl + C', icon: Copy },
              { label: 'Paste Buffer', combo: 'Ctrl + V', icon: Copy },
              { label: 'Toggle Mute', combo: 'Volume Mute', icon: Volume2 },
              { label: 'Lock Windows', combo: 'Win + L', icon: Lock },
              { label: 'Select All', combo: 'Ctrl + A', icon: Keyboard },
            ].map((hk) => {
              const Icon = hk.icon;
              return (
                <button
                  key={hk.label}
                  onClick={() => dispatchHotkey(hk.label, hk.combo)}
                  className="flex flex-col items-start p-2 rounded-lg bg-slate-950/80 border border-cyan-500/15 hover:border-cyan-500/40 hover:bg-cyan-950/30 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-200">
                    <Icon className="w-3 h-3 text-cyan-400" />
                    <span>{hk.label}</span>
                  </div>
                  <div className="text-[9px] text-cyan-400 font-mono mt-0.5">{hk.combo}</div>
                </button>
              );
            })}
          </div>

          {/* Custom String Input Dispatcher */}
          <form onSubmit={dispatchCustomText} className="space-y-1.5 pt-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold">TYPE TEXT INTO ACTIVE APP</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type text to simulate typing..."
                className="flex-1 bg-slate-950 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-md"
              >
                Send Keys
              </button>
            </div>
          </form>

          {/* Action Log Feed */}
          <div className="pt-2 border-t border-slate-800 flex-1 flex flex-col">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center justify-between">
              <span>CONTROLLER TELEMETRY AUDIT</span>
              <button
                onClick={handleDownloadAutomationScript}
                className="text-[9px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Get Python pyautogui Script</span>
              </button>
            </div>
            <div className="bg-black/90 border border-slate-800 rounded-lg p-2 font-mono text-[9px] space-y-1 overflow-y-auto max-h-24 flex-1 text-slate-400">
              {actionHistory.map((log, i) => (
                <div key={i} className="text-cyan-300/80">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
