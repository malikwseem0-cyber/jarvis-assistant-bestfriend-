import React, { useState } from 'react';
import {
  Settings,
  Headphones,
  Sliders,
  Cpu,
  Shield,
  Mic,
  Key,
  Database,
  Radio,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { VoiceProfileSettings } from './VoiceProfileSettings';
import { VoiceProfileConfig } from '../types';

interface SettingsViewProps {
  voiceProfile: VoiceProfileConfig;
  onChangeVoiceProfile: (newProfile: VoiceProfileConfig) => void;
  onTestVoice: (sampleText: string) => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
  voice: string;
  onChangeVoice: (v: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  voiceProfile,
  onChangeVoiceProfile,
  onTestVoice,
  language,
  onChangeLanguage,
  voice,
  onChangeVoice,
}) => {
  const [activeSettingsSection, setActiveSettingsSection] = useState<'voice' | 'model' | 'security' | 'shortcuts'>('voice');

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full font-mono text-xs text-slate-200">
      {/* Settings Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-cyan-500/25 rounded-2xl p-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span className="font-extrabold uppercase tracking-widest text-cyan-300 text-sm">
            JARVIS CONFIGURATION & SUBSYSTEM SETTINGS
          </span>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'voice', label: 'Voice Profile (Sub-Component)', icon: Headphones },
            { id: 'model', label: 'AI Model & Core', icon: Cpu },
            { id: 'security', label: 'Security & Sandboxing', icon: Shield },
            { id: 'shortcuts', label: 'Hotkeys & Hardware', icon: Mic },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSettingsSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSettingsSection(sec.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/60 font-bold shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {activeSettingsSection === 'voice' && (
        <div className="space-y-4 animate-fade-in">
          {/* Real-time Voice Profile Sub-Component */}
          <VoiceProfileSettings
            config={voiceProfile}
            onChangeConfig={(newCfg) => {
              onChangeVoiceProfile(newCfg);
              onChangeVoice(newCfg.voice);
            }}
            onTestVoice={onTestVoice}
          />
        </div>
      )}

      {activeSettingsSection === 'model' && (
        <div className="bg-slate-950/80 border border-cyan-500/25 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              NEURAL ARCHITECTURE & GEMINI MODEL SPECIFICATION
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
              CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-cyan-300 font-bold">Primary Reasoning Model</div>
              <div className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                models/gemini-3.8-flash
              </div>
              <p className="text-slate-400 text-[10px] font-sans leading-relaxed">
                Optimized for low-latency voice interaction, complex task decomposition, and code generation on Windows 10/11.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-cyan-300 font-bold">Neural Speech Synthesis Model</div>
              <div className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                models/gemini-3.8-flash-lite-tts (Fallback: Web Speech British Male)
              </div>
              <p className="text-slate-400 text-[10px] font-sans leading-relaxed">
                Direct audio output stream with reactive frequency visualizers and real-time cadence adjustments.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSettingsSection === 'security' && (
        <div className="bg-slate-950/80 border border-cyan-500/25 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              WINDOWS 10/11 EXECUTION BOUNDARIES & AUDIT LOGS
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
              LEVEL 0 - 3 ENFORCED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { level: 'Level 0', desc: 'Informational queries & telemetry reading. Auto-authorized.' },
              { level: 'Level 1', desc: 'Non-destructive reads, indexed file scans, memory queries.' },
              { level: 'Level 2', desc: 'File creation, app launch, script staging. Requires user prompt.' },
              { level: 'Level 3', desc: 'File deletion, process termination, self-improve code patch.' },
            ].map((lvl, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1">
                <span className="text-cyan-300 font-bold text-xs">{lvl.level}</span>
                <p className="text-slate-400 text-[10px] font-sans leading-relaxed">{lvl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSettingsSection === 'shortcuts' && (
        <div className="bg-slate-950/80 border border-cyan-500/25 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              PUSH-TO-TALK & DESKTOP HOTKEYS
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">STANDBY</span>
          </div>

          <div className="space-y-2">
            {[
              { key: 'SPACE (Hold)', action: 'Push-To-Talk Voice Transmission' },
              { key: 'H', action: 'Toggle Cinema Mode / Collapse Control Dock' },
              { key: 'ESC', action: 'Interrupt Active Speech Playback / Kill Switch' },
              { key: 'ENTER', action: 'Submit Directive in Terminal Console' },
            ].map((hk, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="font-bold text-cyan-400">{hk.key}</span>
                <span className="text-slate-300 text-[11px] font-sans">{hk.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
