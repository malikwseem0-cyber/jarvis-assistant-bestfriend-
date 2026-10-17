import React, { useState } from 'react';
import {
  MessageSquare,
  ListTodo,
  FolderTree,
  BrainCircuit,
  GitPullRequest,
  Wrench,
  Download,
  ChevronDown,
  ChevronUp,
  Globe,
  Settings,
  Send,
  Volume2,
  Code2,
  Palette,
  Gamepad2,
  MousePointer,
} from 'lucide-react';

export type ActiveTab = 'console' | 'python' | 'paint_3d' | 'controller' | 'game' | 'tasks' | 'files' | 'memory' | 'self_improve' | 'tools' | 'settings';

interface ControlOverlayProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
  voice: string;
  onChangeVoice: (v: string) => void;
  onOpenDownloadModal: () => void;
  onSendMessage: (text: string) => void;
  isThinking: boolean;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  activeTab,
  onChangeTab,
  language,
  onChangeLanguage,
  voice,
  onChangeVoice,
  onOpenDownloadModal,
  onSendMessage,
  isThinking,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isThinking) return;
    onSendMessage(inputVal);
    setInputVal('');
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95vw] max-w-[960px] pointer-events-auto">
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-0.5 rounded-t-lg bg-slate-900/90 border-t border-x border-cyan-500/30 text-cyan-400 hover:text-cyan-200 text-[10px] font-mono tracking-widest uppercase transition-all backdrop-blur-md cursor-pointer shadow-lg"
          title="Toggle Zen Viewport (H key)"
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isCollapsed ? 'Show Controls' : 'Cinema Mode'}</span>
        </button>
      </div>

      {/* Main Unified Bottom Dock */}
      <div
        className={`transition-all duration-300 ease-out transform ${
          isCollapsed ? 'translate-y-[120%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-2.5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.12)] font-mono text-xs text-slate-200">
          {/* Quick Text Input Bar */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type directive (e.g. 'diagnose system', 'search files', 'create script')..."
              className="flex-1 bg-slate-900/90 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isThinking || !inputVal.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>

          {/* Tab Selector & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-cyan-500/15">
            {/* View Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'console', label: 'Console', icon: MessageSquare },
                { id: 'python', label: 'Python Studio', icon: Code2 },
                { id: 'paint_3d', label: '3D Paint & Edit', icon: Palette },
                { id: 'controller', label: 'Mouse & Keys', icon: MousePointer },
                { id: 'game', label: '3D Game', icon: Gamepad2 },
                { id: 'tasks', label: 'Tasks', icon: ListTodo },
                { id: 'files', label: 'File Map', icon: FolderTree },
                { id: 'memory', label: 'Memory', icon: BrainCircuit },
                { id: 'self_improve', label: 'Self-Improve', icon: GitPullRequest },
                { id: 'tools', label: 'Tools', icon: Wrench },
                { id: 'settings', label: 'Voice Profile', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onChangeTab(tab.id as ActiveTab)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions & Settings Trigger */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-900 border border-cyan-500/20 rounded-lg px-2 py-1 text-[10px]">
                <Globe className="w-3 h-3 text-cyan-400" />
                <select
                  value={language}
                  onChange={(e) => onChangeLanguage(e.target.value)}
                  className="bg-transparent text-cyan-300 focus:outline-none cursor-pointer"
                >
                  <option value="en" className="bg-slate-900 text-slate-200">English</option>
                  <option value="ur" className="bg-slate-900 text-slate-200">اردو (Urdu)</option>
                  <option value="multi" className="bg-slate-900 text-slate-200">Multilingual</option>
                </select>
              </div>

              {/* Voice Selector - JARVIS Male Voice First */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-cyan-500/20 rounded-lg px-2 py-1 text-[10px]">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <select
                  value={voice}
                  onChange={(e) => onChangeVoice(e.target.value)}
                  className="bg-transparent text-cyan-300 focus:outline-none cursor-pointer"
                >
                  <option value="Fenrir" className="bg-slate-900 text-cyan-300 font-bold">JARVIS Male (Fenrir - Deep British)</option>
                  <option value="Charon" className="bg-slate-900 text-slate-200">JARVIS Male (Charon - Butler)</option>
                  <option value="Puck" className="bg-slate-900 text-slate-200">JARVIS Male (Puck - Crisp)</option>
                  <option value="Zephyr" className="bg-slate-900 text-slate-200">Zephyr (Futuristic)</option>
                  <option value="Kore" className="bg-slate-900 text-slate-200">Kore (Harmonic)</option>
                </select>
              </div>

              {/* Windows Standalone ZIP Download */}
              <button
                onClick={onOpenDownloadModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                title="Download Standalone Windows Desktop Package"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>GET .ZIP</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
